import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faCircleCheck,
  faCircleExclamation,
  faCircleInfo,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { SbbMessageSeverity } from './message.models';

const SEVERITY_ICONS: Record<SbbMessageSeverity, IconDefinition> = {
  info: faCircleInfo,
  success: faCircleCheck,
  warn: faTriangleExclamation,
  error: faCircleExclamation,
};

/**
 * `SbbMessage` — a styled, pure-display inline severity message/alert.
 *
 * Opinionated-minimal API distilled from the current `p-message` call sites:
 * a `severity` (info/success/warn/error, defaults to `'info'`) that drives an
 * icon + color, and projected text content for the message body. There is no
 * dismiss/close behavior and no service — this is purely a static banner
 * component; for stacked/auto-dismissing notifications use the (separate)
 * toast service.
 *
 * Usage:
 * ```html
 * <sbb-message severity="error">Connection failed. Check your credentials.</sbb-message>
 * <sbb-message severity="success">Message sent.</sbb-message>
 * <sbb-message>Queue depth may take a few seconds to update.</sbb-message>
 * ```
 */
@Component({
  selector: 'sbb-message',
  imports: [FaIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './message.html',
  styleUrl: './message.scss',
  host: {
    class: 'sbb-message-host',
    role: 'alert',
  },
})
export class SbbMessage {
  /** Visual/semantic intent. Defaults to `'info'`. */
  readonly severity = input<SbbMessageSeverity>('info');

  /** Icon shown for the current severity. */
  protected readonly icon = computed(() => SEVERITY_ICONS[this.severity()]);

  protected readonly messageClasses = computed(() => ({
    'sbb-message': true,
    [`sbb-message--${this.severity()}`]: true,
  }));
}
