import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SbbRadioOrientation } from './radio-group.models';
import { SBB_RADIO_GROUP, SbbRadioFocusable } from './radio-group.token';

let nextGroupId = 0;

/**
 * `SbbRadioGroup` — a styled, accessible radio group implementing
 * `ControlValueAccessor`. Value is the selected option's `value`.
 *
 * Opinionated-minimal public API (derived from current `p-radiobutton` usage):
 *  - `orientation`  layout of the projected `<sbb-radio>` children.
 *  - `disabled`     disables every child radio (individual radios may also
 *                    be disabled on their own).
 *  - value          set/read via `[(ngModel)]` / reactive forms (CVA), NOT
 *                    a plain `@Input value` — matches how call sites bind it.
 *
 * Children are plain `<sbb-radio [value]="...">label</sbb-radio>` elements
 * projected via `<ng-content>`; they register with this group through DI.
 */
@Component({
  selector: 'sbb-radio-group',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './radio-group.component.html',
  styleUrl: './radio-group.component.scss',
  host: {
    role: 'radiogroup',
    '[attr.aria-orientation]': 'orientation()',
    '[class.sbb-radio-group--horizontal]': "orientation() === 'horizontal'",
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SbbRadioGroup),
      multi: true,
    },
    {
      provide: SBB_RADIO_GROUP,
      useExisting: forwardRef(() => SbbRadioGroup),
    },
  ],
})
export class SbbRadioGroup implements ControlValueAccessor {
  /** Layout of the projected options. Defaults to vertical (stacked). */
  readonly orientation = input<SbbRadioOrientation>('vertical');

  /** Unique `name` shared by every radio input in this group. */
  protected readonly name = signal(`sbb-radio-group-${nextGroupId++}`);

  protected readonly value = signal<unknown>(undefined);
  protected readonly disabled = signal(false);

  private readonly focusables: SbbRadioFocusable[] = [];

  private onChange: (value: unknown) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: unknown): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  /** Called by a child `SbbRadio` when the user selects it. */
  select(value: unknown): void {
    this.onTouched();
    if (this.value() === value) {
      return;
    }
    this.value.set(value);
    this.onChange(value);
  }

  registerFocusable(radio: SbbRadioFocusable): void {
    this.focusables.push(radio);
  }

  deregisterFocusable(radio: SbbRadioFocusable): void {
    const index = this.focusables.indexOf(radio);
    if (index >= 0) {
      this.focusables.splice(index, 1);
    }
  }

  focusNext(current: SbbRadioFocusable): void {
    this.moveFocus(current, 1);
  }

  focusPrevious(current: SbbRadioFocusable): void {
    this.moveFocus(current, -1);
  }

  private moveFocus(current: SbbRadioFocusable, step: 1 | -1): void {
    const enabled = this.focusables.filter((f) => !f.disabled);
    if (enabled.length === 0) {
      return;
    }
    const currentIndex = enabled.indexOf(current);
    const startIndex = currentIndex < 0 ? 0 : currentIndex;
    const nextIndex =
      (startIndex + step + enabled.length) % enabled.length;
    const next = enabled[nextIndex];
    next.focus();
    this.select(next.value);
  }
}
