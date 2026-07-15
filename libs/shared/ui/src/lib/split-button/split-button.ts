import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { SbbButton, SbbButtonSeverity } from '../button';
import { SbbMenuItem } from '../menu';
import { SbbMenu } from '../popup-menu';

/**
 * `SbbSplitButton` — a primary action button joined to a caret button that
 * opens a dropdown of secondary actions.
 *
 * Opinionated-minimal replacement for PrimeNG's `p-split-button`, distilled
 * from the real `messages-batch-resend` call site
 * (`label`, `icon`, `severity`, `disabled`, `[model]`, `(onClick)`).
 *
 * The primary action composes `SbbButton` (label + FontAwesome `icon`) and
 * re-emits its click via `clicked`. The caret is a second icon-only
 * `SbbButton` that opens an embedded {@link SbbMenu} (native HTML Popover API),
 * not a body-portaled CDK overlay — so a split button placed inside another
 * popover won't light-dismiss it. CDK types never surface in the public API.
 *
 * ```html
 * <sbb-split-button
 *   label="Send batch"
 *   [icon]="faPaperPlane"
 *   [model]="secondaryItems()"
 *   [disabled]="busy()"
 *   (clicked)="resendMessages()"
 * />
 * ```
 */
@Component({
  selector: 'sbb-split-button',
  standalone: true,
  imports: [SbbButton, SbbMenu],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './split-button.html',
  styleUrl: './split-button.scss',
  host: { class: 'sbb-split-button-host' },
})
export class SbbSplitButton {
  /** Label of the primary action button. */
  readonly label = input('');

  /** Leading FontAwesome icon for the primary action button. */
  readonly icon = input<IconDefinition | undefined>(undefined);

  /** Visual intent, passed straight through to both inner buttons. */
  readonly severity = input<SbbButtonSeverity>('primary');

  /** Disables the primary button and the dropdown trigger. */
  readonly disabled = input(false);

  /** Secondary actions shown in the dropdown. */
  readonly model = input<SbbMenuItem<void>[]>([]);

  /** Emitted when the primary action button is clicked. */
  readonly clicked = output<void>();

  /** Caret icon shown on the dropdown-trigger button. */
  protected readonly caretIcon: IconDefinition = faChevronDown;
}
