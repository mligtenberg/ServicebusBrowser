import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  SbbDividerAlign,
  SbbDividerOrientation,
  SbbDividerType,
} from './divider.models';

/**
 * `SbbDivider` — a styled horizontal/vertical rule with optional projected
 * content (e.g. a label or icon breaking the line).
 *
 * Replaces PrimeNG's `p-divider` call sites. Opinionated-minimal: layout
 * (horizontal/vertical), stroke `type`, and `align` for projected content on
 * horizontal dividers.
 *
 * Usage:
 * ```html
 * <sbb-divider />
 * <sbb-divider layout="vertical" />
 * <sbb-divider align="left">Or</sbb-divider>
 * <sbb-divider type="dashed">Optional</sbb-divider>
 * ```
 */
@Component({
  selector: 'sbb-divider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './divider.html',
  styleUrl: './divider.scss',
  host: {
    class: 'sbb-divider-host',
    role: 'separator',
    '[class]': 'hostClasses()',
    '[attr.aria-orientation]': 'layout()',
  },
})
export class SbbDivider {
  /** Rule orientation. Defaults to `'horizontal'`. */
  readonly layout = input<SbbDividerOrientation>('horizontal');

  /** Rule stroke style. Defaults to `'solid'`. */
  readonly type = input<SbbDividerType>('solid');

  /** Position of projected content along a horizontal rule. Defaults to `'center'`. */
  readonly align = input<SbbDividerAlign>('center');

  protected readonly hostClasses = computed(() => ({
    'sbb-divider': true,
    [`sbb-divider--${this.layout()}`]: true,
    [`sbb-divider--${this.type()}`]: true,
    [`sbb-divider--align-${this.align()}`]: this.layout() === 'horizontal',
  }));
}
