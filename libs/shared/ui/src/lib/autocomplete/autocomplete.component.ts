import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  DestroyRef,
  ElementRef,
  forwardRef,
  inject,
  input,
  output,
  signal,
  TemplateRef,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  SbbAutocompleteGroupLabelDef,
  SbbAutocompleteItemDef,
} from './autocomplete.directives';
import { SbbAutocompleteGroup } from './autocomplete.models';

/**
 * `SbbAutocomplete<T>` — a text input with a suggestion panel, supporting flat
 * or grouped suggestions, custom item/group templates and free-text entry.
 *
 * Opinionated-minimal replacement for PrimeNG's `<p-autocomplete>`. Public API
 * derived from the current call sites:
 *  - simple free-text suggest (messages forms): `[(ngModel)]` a string,
 *    `[suggestions]`, `(completeChange)` as the user types, free text kept.
 *  - grouped + templated (topology tree search): `[groups]`, custom
 *    `sbbAutocompleteItem`/`sbbAutocompleteGroupLabel` templates,
 *    `completeOnFocus`, `minLength=0`, `(selected)`/`(cleared)`.
 *
 * Implementation note: rather than assembling `@spartan-ng/brain/autocomplete`
 * — which couples `BrnPopover` + `brnPopoverContent` + `brnAutocompleteContent`
 * in a version-sensitive way — this is built directly on `@angular/cdk/overlay`
 * per the migration's CDK escape hatch, giving full control over grouping,
 * templating and free-text semantics. brain/CDK types never surface in the
 * public API; the internals can be swapped later behind this same surface.
 */
@Component({
  selector: 'sbb-autocomplete',
  standalone: true,
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './autocomplete.component.html',
  styleUrl: './autocomplete.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SbbAutocomplete),
      multi: true,
    },
  ],
  host: { class: 'sbb-autocomplete-host' },
})
export class SbbAutocomplete<T> implements ControlValueAccessor {
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Flat suggestions. Ignored when {@link groups} is set. */
  readonly suggestions = input<readonly T[]>([]);

  /** Grouped suggestions. When set, takes precedence over {@link suggestions}. */
  readonly groups = input<readonly SbbAutocompleteGroup<T>[] | null>(null);

  /** Placeholder shown when empty. */
  readonly placeholder = input('');

  /** Minimum query length before the panel opens. */
  readonly minLength = input(1);

  /** Open the panel (and emit the current query) on focus. */
  readonly completeOnFocus = input(false);

  /** When true, a free-typed string that matches no item is not kept as the value. */
  readonly forceSelection = input(false);

  /** Disables the control. Also settable via CVA. */
  readonly disabled = input(false);

  /** Converts an item to its display string (default `String(item)`). */
  readonly displayWith = input<(item: T) => string>();

  /** Emits the current query whenever the user types (or on focus-complete). */
  readonly completeChange = output<string>();

  /** Emits the chosen item when a suggestion is selected. */
  readonly selected = output<T>();

  /** Emits when the field is cleared. */
  readonly cleared = output<void>();

  protected readonly itemDef = contentChild(SbbAutocompleteItemDef);
  protected readonly groupLabelDef = contentChild(SbbAutocompleteGroupLabelDef);
  private readonly panel = viewChild.required<TemplateRef<unknown>>('panel');

  private static nextId = 0;

  /** Stable id linking the input (`aria-controls`) to the listbox panel. */
  protected readonly listboxId = `sbb-autocomplete-panel-${SbbAutocomplete.nextId++}`;

  /** Current input text. */
  protected readonly query = signal('');

  /** Whether the suggestion panel is open. */
  protected readonly isOpen = signal(false);

  /** Index of the highlighted item within {@link flatItems}, or -1. */
  protected readonly activeIndex = signal(-1);

  private readonly value = signal<T | string | null>(null);
  private readonly disabledFromCva = signal(false);

  protected readonly isDisabled = computed(
    () => this.disabled() || this.disabledFromCva(),
  );

  /** All items in render order, used for keyboard navigation. */
  protected readonly flatItems = computed<readonly T[]>(() => {
    const groups = this.groups();
    if (groups) {
      return groups.flatMap((group) => [...group.items]);
    }
    return this.suggestions();
  });

  private overlayRef: OverlayRef | undefined;
  private subscriptions = new Subscription();

  private onChange: (value: T | string | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.close());
  }

  protected display(item: T | string | null): string {
    if (item === null || item === undefined) {
      return '';
    }
    if (typeof item === 'string') {
      return item;
    }
    const fn = this.displayWith();
    return fn ? fn(item) : String(item);
  }

  protected isActive(item: T): boolean {
    const index = this.activeIndex();
    return index >= 0 && this.flatItems()[index] === item;
  }

  protected onInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    this.query.set(raw);
    this.activeIndex.set(-1);

    if (raw === '') {
      this.value.set(null);
      this.onChange(null);
      this.cleared.emit();
    } else if (!this.forceSelection()) {
      this.value.set(raw);
      this.onChange(raw);
    }

    this.completeChange.emit(raw);

    if (raw.length >= this.minLength()) {
      this.open();
    } else {
      this.close();
    }
  }

  protected onFocus(): void {
    if (this.completeOnFocus() && !this.isDisabled()) {
      this.completeChange.emit(this.query());
      this.open();
    }
  }

  protected onBlur(): void {
    this.onTouched();
  }

  protected onKeydown(event: KeyboardEvent): void {
    const items = this.flatItems();
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen()) {
          this.open();
        }
        this.activeIndex.set(Math.min(items.length - 1, this.activeIndex() + 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex.set(Math.max(0, this.activeIndex() - 1));
        break;
      case 'Enter': {
        const active = items[this.activeIndex()];
        if (this.isOpen() && active !== undefined) {
          event.preventDefault();
          this.selectItem(active);
        }
        break;
      }
      case 'Escape':
        this.close();
        break;
    }
  }

  protected setActive(item: T): void {
    this.activeIndex.set(this.flatItems().indexOf(item));
  }

  protected selectItem(item: T): void {
    this.value.set(item);
    this.query.set(this.display(item));
    this.onChange(item);
    this.selected.emit(item);
    this.close();
  }

  private open(): void {
    if (this.isDisabled()) {
      return;
    }
    this.isOpen.set(true);
    if (this.overlayRef) {
      return;
    }

    const host = this.hostRef.nativeElement;
    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(host)
        .withPositions([
          { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
          { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
        ]),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      width: host.offsetWidth,
    });
    this.overlayRef.attach(new TemplatePortal(this.panel(), this.viewContainerRef));

    this.subscriptions = new Subscription();
    this.subscriptions.add(
      this.overlayRef.outsidePointerEvents().subscribe((event) => {
        if (!host.contains(event.target as Node)) {
          this.close();
        }
      }),
    );
  }

  private close(): void {
    this.isOpen.set(false);
    this.activeIndex.set(-1);
    this.subscriptions.unsubscribe();
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
  }

  writeValue(value: T | string | null | undefined): void {
    this.value.set(value ?? null);
    this.query.set(this.display(value ?? null));
  }

  registerOnChange(fn: (value: T | string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledFromCva.set(isDisabled);
  }
}
