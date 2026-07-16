import { InjectionToken, Signal } from '@angular/core';

/**
 * Internal contract between `SbbRadioGroup` and its `SbbRadio` children.
 * Not exported from the public barrel — implementation detail only.
 */
export interface SbbRadioGroupContract {
  readonly name: Signal<string>;
  readonly value: Signal<unknown>;
  readonly disabled: Signal<boolean>;
  select(value: unknown): void;
  registerFocusable(radio: SbbRadioFocusable): void;
  deregisterFocusable(radio: SbbRadioFocusable): void;
  focusNext(current: SbbRadioFocusable): void;
  focusPrevious(current: SbbRadioFocusable): void;
}

export interface SbbRadioFocusable {
  readonly value: Signal<unknown>;
  readonly disabled: Signal<boolean>;
  focus(): void;
}

export const SBB_RADIO_GROUP = new InjectionToken<SbbRadioGroupContract>(
  'SbbRadioGroup',
);
