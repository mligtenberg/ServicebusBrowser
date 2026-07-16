import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Progress bar. Derived from current `p-progress-bar` call sites:
 *  - determinate with a numeric `[value]` (task progress %, or 100 on completion)
 *  - indeterminate (`mode="indeterminate"`) while a task's real progress is unknown
 */
@Component({
  selector: 'sbb-progress-bar',
  templateUrl: './progress-bar.html',
  styleUrl: './progress-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'progressbar',
    '[attr.aria-valuenow]': 'indeterminate() ? null : clampedValue()',
    '[attr.aria-valuemin]': 'indeterminate() ? null : 0',
    '[attr.aria-valuemax]': 'indeterminate() ? null : 100',
  },
})
export class SbbProgressBar {
  /** Current progress, 0-100. Ignored when `indeterminate` is true. */
  readonly value = input<number>(0);

  /** Renders a continuously animating bar instead of a fixed `value`. */
  readonly indeterminate = input<boolean>(false);

  protected readonly clampedValue = computed(() => Math.min(100, Math.max(0, this.value())));
}
