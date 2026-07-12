import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { SbbButton, SbbButtonSeverity } from '../button';
import { isSbbMenuSeparator, SbbMenuItem, SbbMenuSeparator } from '../menu';

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
 * `SbbButton` wired as a `@angular/cdk/menu` trigger; the dropdown mirrors the
 * recursive `SbbContextMenu` panel, building `CdkMenuItem`s from the
 * `SbbMenuItem` model and invoking each chosen item's `onSelect`. CDK types
 * never surface in the public API.
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
  imports: [SbbButton, CdkMenu, CdkMenuItem, CdkMenuTrigger],
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

  /** Template type guard so the recursive template can branch on separators. */
  protected isSeparator(item: SbbMenuItem<void>): item is SbbMenuSeparator {
    return isSbbMenuSeparator(item);
  }

  /** Invokes the chosen item's `onSelect` or `command`. */
  protected invoke(item: SbbMenuItem<void>): void {
    if (isSbbMenuSeparator(item)) {
      return;
    }
    item.onSelect?.();
    if ('command' in item && typeof item.command === 'function') {
      item.command({ item });
    }
  }

  /** Resolves value that can be either a plain type or a signal/function. */
  protected resolve<V>(value: V | (() => V) | undefined): V | undefined {
    if (typeof value === 'function') {
      return (value as () => V)();
    }
    return value;
  }
}
