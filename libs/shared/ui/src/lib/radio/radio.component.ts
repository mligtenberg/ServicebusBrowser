import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { SBB_RADIO_GROUP, SbbRadioFocusable } from './radio-group.token';

let nextRadioId = 0;

/**
 * `SbbRadio` — a single option within an `<sbb-radio-group>`. Renders a
 * native, accessible `<input type="radio">` styled via `--sbb-*` tokens.
 * Must be projected inside an `<sbb-radio-group>`; it registers itself with
 * the parent group via DI for value/selection and roving-tabindex keyboard
 * navigation (arrow keys move + select, matching native radio behavior).
 *
 * Label content is provided via `<ng-content>`, e.g.:
 * `<sbb-radio [value]="'azureAD'">Azure AD</sbb-radio>`
 */
@Component({
  selector: 'sbb-radio',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './radio.component.html',
  styleUrl: './radio.component.scss',
  host: {
    class: 'sbb-radio',
  },
})
export class SbbRadio implements SbbRadioFocusable {
  /** The value this option represents within the group's CVA value. */
  readonly value = input.required<unknown>();

  /** Disables this individual option, independent of the group. */
  readonly disabled = input(false);

  private readonly group = inject(SBB_RADIO_GROUP, { optional: true });

  protected readonly inputId = `sbb-radio-${nextRadioId++}`;

  private readonly inputRef =
    viewChild<ElementRef<HTMLInputElement>>('inputEl');

  protected readonly groupName = signal('sbb-radio');

  constructor() {
    this.groupName.set(this.group?.name() ?? this.groupName());
    this.group?.registerFocusable(this);
    inject(DestroyRef).onDestroy(() => this.group?.deregisterFocusable(this));
  }

  protected isChecked(): boolean {
    return this.group?.value() === this.value();
  }

  protected isDisabled(): boolean {
    return this.disabled() || (this.group?.disabled() ?? false);
  }

  focus(): void {
    this.inputRef()?.nativeElement.focus();
  }

  protected onSelect(): void {
    if (this.isDisabled()) {
      return;
    }
    this.group?.select(this.value());
  }

  protected onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        this.group?.focusNext(this);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        this.group?.focusPrevious(this);
        break;
      default:
        break;
    }
  }
}
