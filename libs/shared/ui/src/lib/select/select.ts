import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  forwardRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { SbbPopover } from '../popover';
import {
  isSbbSelectOptionGroup,
  SbbSelectOption,
  SbbSelectOptionGroup,
  SbbSelectOptions,
} from './select.models';

let nextSelectId = 0;

/** A filtered option paired with the DOM id it renders under, for ARIA + keyboard nav. */
interface SbbSelectFlatOption<T> {
  readonly option: SbbSelectOption<T>;
  readonly id: string;
}

/**
 * `SbbSelect` — a styled, `ControlValueAccessor`-compliant single-select
 * dropdown.
 *
 * Opinionated-minimal replacement for `p-select`. Public API derived from
 * current call sites (`p-select` usages across messages/connections/
 * management forms):
 *  - `options`       flat `SbbSelectOption<T>[]` or grouped
 *                     `SbbSelectOptionGroup<T>[]` (parity with `[group]="true"`
 *                     + `optionGroupLabel`/`optionGroupChildren` usage in the
 *                     messages grid column picker).
 *  - `placeholder`   shown when no value is selected.
 *  - `disabled`      disables the trigger (also settable via CVA).
 *  - `searchable`    shows a filter input above the list (parity with
 *                     `[filter]="true"`).
 *
 * Built on {@link SbbPopover} — the native HTML Popover API (`popover`) plus
 * CSS anchor positioning. Because `SbbPopover` renders its panel as a DOM
 * descendant (rather than portaling into a body-level overlay container), a
 * select opened *inside* another popover forms a native popover ancestor
 * chain: clicking an option is a click "inside" the parent for light-dismiss
 * purposes, so the parent popover stays open. This is the whole reason the
 * dropdown is not a CDK overlay — those portal to
 * `<body>`, land outside the parent's subtree, and light-dismiss it.
 *
 * The listbox semantics (keyboard navigation, `aria-activedescendant`,
 * roles) are implemented here directly on top of that overlay.
 */
@Component({
  selector: 'sbb-select',
  standalone: true,
  imports: [SbbPopover, FaIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select.html',
  styleUrl: './select.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SbbSelect),
      multi: true,
    },
  ],
  host: {
    class: 'sbb-select-host',
  },
})
export class SbbSelect<T> implements ControlValueAccessor {
  private readonly document = inject(DOCUMENT);

  /** Flat or grouped options rendered in the dropdown list. */
  readonly options = input<SbbSelectOptions<T>>([]);

  /** Placeholder text shown when no value is selected. */
  readonly placeholder = input<string>('');

  /** Shows a text filter above the option list. */
  readonly searchable = input<boolean>(false);

  /**
   * `id` forwarded onto the trigger `<button>`, so an external
   * `<sbb-float-label for="x">` (or any plain `<label for>`) can associate
   * its label with the control.
   */
  readonly inputId = input<string | undefined>(undefined);

  /**
   * Accessible name for the trigger, rendered as `aria-label`. When unset, the
   * trigger is instead labelled by its visible value/placeholder text (see
   * `valueLabelId`) — `role="combobox"` does not derive its name from content,
   * so an explicit association is required for a discernible name.
   */
  readonly ariaLabel = input<string | undefined>(undefined);

  private readonly instanceId = nextSelectId++;

  /**
   * Fallback id used on the trigger `<button>` when `inputId` is not set, and
   * the base for per-option ids used by `aria-activedescendant`.
   */
  protected readonly generatedTriggerId = `sbb-select-trigger-${this.instanceId}`;

  /** `id` of the listbox panel, linked from the trigger via `aria-controls`. */
  protected readonly listboxId = `sbb-select-listbox-${this.instanceId}`;

  /** `id` of the visible value/placeholder text, used as the trigger's `aria-labelledby`. */
  protected readonly valueLabelId = `sbb-select-value-${this.instanceId}`;

  /** Caret icon shown on the right-hand side of the trigger. */
  protected readonly caretIcon: IconDefinition = faChevronDown;

  /** Current value, reflected from the CVA and by user selection. */
  protected readonly value = signal<T | null>(null);

  /** Disabled state, settable both via CVA input and reflected in the template. */
  protected readonly disabled = signal(false);

  /** Free-text filter query, only used when `searchable()` is true. */
  protected readonly filterQuery = signal('');

  /** Index of the highlighted option within {@link flatOptions}, or -1 when none. */
  protected readonly activeIndex = signal(-1);

  private readonly popover = viewChild.required(SbbPopover);
  private readonly triggerRef =
    viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly filterRef =
    viewChild<ElementRef<HTMLInputElement>>('filter');

  /** Minimum panel width, tracked from the trigger so the list can't be narrower. */
  protected readonly triggerWidth = signal(0);

  /** Flattened groups so the template can render a uniform structure. */
  protected readonly groups = computed<SbbSelectOptionGroup<T>[]>(() => {
    const entries = this.options();
    if (entries.length === 0) {
      return [];
    }
    if (isSbbSelectOptionGroup(entries[0])) {
      return entries as SbbSelectOptionGroup<T>[];
    }
    return [{ label: '', options: entries as SbbSelectOption<T>[] }];
  });

  /** Groups filtered by `filterQuery`, empty groups removed. */
  protected readonly filteredGroups = computed<SbbSelectOptionGroup<T>[]>(
    () => {
      const query = this.filterQuery().trim().toLowerCase();
      if (!query) {
        return this.groups();
      }
      return this.groups()
        .map((group) => ({
          label: group.label,
          options: group.options.filter((option) =>
            option.label.toLowerCase().includes(query),
          ),
        }))
        .filter((group) => group.options.length > 0);
    },
  );

  /**
   * All currently-visible options in render order, each with a stable DOM id.
   * Drives keyboard navigation and `aria-activedescendant`.
   */
  protected readonly flatOptions = computed<SbbSelectFlatOption<T>[]>(() => {
    const flat: SbbSelectFlatOption<T>[] = [];
    let index = 0;
    for (const group of this.filteredGroups()) {
      for (const option of group.options) {
        flat.push({ option, id: `${this.generatedTriggerId}-opt-${index++}` });
      }
    }
    return flat;
  });

  /** DOM id of the highlighted option, or null — for `aria-activedescendant`. */
  protected readonly activeId = computed<string | null>(() => {
    const index = this.activeIndex();
    return index < 0 ? null : (this.flatOptions()[index]?.id ?? null);
  });

  /** Label of the currently selected option, for the trigger text. */
  protected readonly selectedLabel = computed<string | null>(() => {
    const current = this.value();
    if (current === null || current === undefined) {
      return null;
    }
    for (const group of this.groups()) {
      const match = group.options.find((option) =>
        Object.is(option.value, current),
      );
      if (match) {
        return match.label;
      }
    }
    return null;
  });

  private onChange: (value: T | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  /** Whether the dropdown is currently open. */
  protected isOpen(): boolean {
    return this.popover().isOpen();
  }

  /** Toggles the dropdown from a trigger click. */
  protected toggle(): void {
    if (this.disabled()) {
      return;
    }
    this.popover().toggle(this.triggerRef().nativeElement);
  }

  /** Opens the dropdown, anchored to the trigger. */
  private openPanel(): void {
    if (this.disabled() || this.isOpen()) {
      return;
    }
    this.popover().open(this.triggerRef().nativeElement);
  }

  /** Panel opened — size it, seed the active option and move focus. */
  protected onOpened(): void {
    this.triggerWidth.set(this.triggerRef().nativeElement.offsetWidth);
    this.activeIndex.set(this.initialActiveIndex());
    if (this.searchable()) {
      // Defer focus until the popover panel is laid out in the top layer.
      queueMicrotask(() => this.filterRef()?.nativeElement.focus());
    }
    this.scrollActiveIntoView();
  }

  /** Panel closed — reset the filter and highlight. */
  protected onClosed(): void {
    this.filterQuery.set('');
    this.activeIndex.set(-1);
    this.onTouched();
  }

  /** Index of the option to highlight when the panel opens. */
  private initialActiveIndex(): number {
    const flat = this.flatOptions();
    const current = this.value();
    const selected = flat.findIndex(
      ({ option }) => !option.disabled && Object.is(option.value, current),
    );
    if (selected >= 0) {
      return selected;
    }
    return flat.findIndex(({ option }) => !option.disabled);
  }

  /** Keyboard handling on the trigger button (focus lives here when closed). */
  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (this.disabled()) {
      return;
    }
    if (!this.isOpen()) {
      if (
        event.key === 'ArrowDown' ||
        event.key === 'ArrowUp' ||
        event.key === 'Enter' ||
        event.key === ' '
      ) {
        event.preventDefault();
        this.openPanel();
      }
      return;
    }
    // Open + not searchable: focus stays on the trigger, so it drives nav.
    if (!this.searchable()) {
      this.handleNavKeydown(event);
    }
  }

  /** Keyboard handling on the filter input (focus lives here when searchable + open). */
  protected onFilterKeydown(event: KeyboardEvent): void {
    this.handleNavKeydown(event);
  }

  /** Shared list navigation for whichever element currently has focus. */
  private handleNavKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveActive(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveActive(-1);
        break;
      case 'Home':
        event.preventDefault();
        this.moveActiveTo(0, 1);
        break;
      case 'End':
        event.preventDefault();
        this.moveActiveTo(this.flatOptions().length - 1, -1);
        break;
      case 'Enter':
        event.preventDefault();
        this.selectActive();
        break;
      case 'Escape':
        event.preventDefault();
        this.popover().close();
        this.triggerRef().nativeElement.focus();
        break;
      case 'Tab':
        this.popover().close();
        break;
    }
  }

  /** Moves the highlight by `delta`, skipping disabled options, clamped to the ends. */
  private moveActive(delta: number): void {
    const flat = this.flatOptions();
    if (flat.length === 0) {
      return;
    }
    let index = this.activeIndex();
    for (let step = 0; step < flat.length; step++) {
      index += delta;
      if (index < 0 || index >= flat.length) {
        return; // Ran off an end without finding an enabled option — stay put.
      }
      if (!flat[index].option.disabled) {
        this.activeIndex.set(index);
        this.scrollActiveIntoView();
        return;
      }
    }
  }

  /** Sets the highlight starting at `from`, scanning by `step` to skip disabled options. */
  private moveActiveTo(from: number, step: number): void {
    const flat = this.flatOptions();
    for (let index = from; index >= 0 && index < flat.length; index += step) {
      if (!flat[index].option.disabled) {
        this.activeIndex.set(index);
        this.scrollActiveIntoView();
        return;
      }
    }
  }

  /** Commits the highlighted option, if any. */
  private selectActive(): void {
    const active = this.flatOptions()[this.activeIndex()];
    if (active && !active.option.disabled) {
      this.selectOption(active.option);
    }
  }

  /** Looks up the flat entry (stable id) for a rendered option. */
  protected flatOptionFor(
    option: SbbSelectOption<T>,
  ): SbbSelectFlatOption<T> | undefined {
    return this.flatOptions().find((entry) => entry.option === option);
  }

  /** Whether an option matches the current value. */
  protected isSelected(option: SbbSelectOption<T>): boolean {
    return Object.is(option.value, this.value());
  }

  /** Highlights an option on hover, so pointer + keyboard stay in sync. */
  protected setActiveOption(target: SbbSelectFlatOption<T>): void {
    if (target.option.disabled) {
      return;
    }
    this.activeIndex.set(
      this.flatOptions().findIndex((entry) => entry.id === target.id),
    );
  }

  /** Commits an option: writes the value, closes and returns focus to the trigger. */
  protected selectOption(option: SbbSelectOption<T>): void {
    if (option.disabled) {
      return;
    }
    this.handleValueChange(option.value);
    this.popover().close();
    this.triggerRef().nativeElement.focus();
  }

  protected handleValueChange(value: unknown): void {
    const next = (value ?? null) as T | null;
    this.value.set(next);
    this.onChange(next);
  }

  protected handleTouched(): void {
    this.onTouched();
  }

  protected handleFilterInput(query: string): void {
    this.filterQuery.set(query);
    // The old highlight may have been filtered out — reseed to the first match.
    this.activeIndex.set(this.flatOptions().findIndex((e) => !e.option.disabled));
    this.scrollActiveIntoView();
  }

  /**
   * Scrolls the highlighted option into view. The option elements live in this
   * component's view even while the panel is rendered in the top layer, so a
   * plain id lookup finds them; deferred a microtask so the highlight has been
   * flushed to the DOM first.
   */
  private scrollActiveIntoView(): void {
    const id = this.activeId();
    if (!id) {
      return;
    }
    queueMicrotask(() => {
      // `scrollIntoView` is absent under jsdom; guard so tests don't throw.
      this.document.getElementById(id)?.scrollIntoView?.({ block: 'nearest' });
    });
  }

  writeValue(value: T | null | undefined): void {
    this.value.set(value ?? null);
  }

  registerOnChange(fn: (value: T | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
