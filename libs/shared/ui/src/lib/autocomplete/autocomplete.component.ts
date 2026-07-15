import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  DestroyRef,
  effect,
  ElementRef,
  forwardRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SbbPopover } from '../popover';
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
 * Implementation note: the suggestion panel is rendered through
 * {@link SbbPopover} — the native HTML Popover API plus CSS anchor
 * positioning — rather than a body-level CDK overlay. Because `SbbPopover`
 * keeps its panel as a DOM descendant, an autocomplete opened *inside* another
 * popover (e.g. the batch-resend "add action" editor) forms a native popover
 * ancestor chain, so clicking a suggestion no longer light-dismisses the
 * surrounding popover. brain/CDK types never surface in the public API.
 */
@Component({
  selector: 'sbb-autocomplete',
  standalone: true,
  imports: [NgTemplateOutlet, SbbPopover],
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

  private readonly popover = viewChild(SbbPopover);
  private readonly inputRef =
    viewChild.required<ElementRef<HTMLInputElement>>('input');

  private static nextId = 0;

  /** Stable id linking the input (`aria-controls`) to the listbox panel. */
  protected readonly listboxId = `sbb-autocomplete-panel-${SbbAutocomplete.nextId++}`;

  /** Current input text. */
  protected readonly query = signal('');

  /** Whether the user's intent is for the panel to be shown (subject to having items). */
  private readonly wantOpen = signal(false);

  /** Minimum panel width, tracked from the input so the list can't be narrower. */
  protected readonly panelMinWidth = signal(0);

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

  private onChange: (value: T | string | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor() {
    // Drive the popover from intent + availability: only show it once there is
    // something to show, and hide it as soon as the result set empties, so an
    // empty query never leaves a bare panel hanging under the input.
    effect(() => {
      const pop = this.popover();
      if (!pop) {
        return;
      }
      const shouldOpen =
        this.wantOpen() && !this.isDisabled() && this.flatItems().length > 0;
      if (shouldOpen) {
        const input = this.inputRef().nativeElement;
        this.panelMinWidth.set(input.offsetWidth);
        pop.open(input);
      } else {
        pop.close();
      }
    });
    inject(DestroyRef).onDestroy(() => this.wantOpen.set(false));
  }

  /** Whether the suggestion panel is currently open. */
  protected isOpen(): boolean {
    return this.popover()?.isOpen() ?? false;
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
    this.wantOpen.set(raw.length >= this.minLength());
  }

  protected onFocus(): void {
    if (this.completeOnFocus() && !this.isDisabled()) {
      this.completeChange.emit(this.query());
      this.wantOpen.set(true);
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
        this.wantOpen.set(true);
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

  /** Closes the panel and clears the highlight. */
  private close(): void {
    this.wantOpen.set(false);
    this.activeIndex.set(-1);
  }

  /** Panel light-dismissed (outside click / Escape) — sync our intent. */
  protected onPopoverClosed(): void {
    this.wantOpen.set(false);
    this.activeIndex.set(-1);
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
