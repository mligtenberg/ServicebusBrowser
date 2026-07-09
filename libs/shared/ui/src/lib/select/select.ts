import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  BrnSelectImports,
} from '@spartan-ng/brain/select';
import { BrnPopover, BrnPopoverContent } from '@spartan-ng/brain/popover';
import {
  isSbbSelectOptionGroup,
  SbbSelectOption,
  SbbSelectOptionGroup,
  SbbSelectOptions,
} from './select.models';

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
 * Built on `@spartan-ng/brain/select` (`brnSelect` + `BrnPopover` for the
 * overlay) — brain/CDK types are only used inside this component's own
 * template and are not part of the public API surface.
 */
@Component({
  selector: 'sbb-select',
  standalone: true,
  imports: [BrnSelectImports, BrnPopover, BrnPopoverContent],
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
  /** Flat or grouped options rendered in the dropdown list. */
  readonly options = input<SbbSelectOptions<T>>([]);

  /** Placeholder text shown when no value is selected. */
  readonly placeholder = input<string>('');

  /** Shows a text filter above the option list. */
  readonly searchable = input<boolean>(false);

  /** Current value, reflected from the CVA and by user selection. */
  protected readonly value = signal<T | null>(null);

  /** Disabled state, settable both via CVA input and reflected in the template. */
  protected readonly disabled = signal(false);

  /** Free-text filter query, only used when `searchable()` is true. */
  protected readonly filterQuery = signal('');

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
