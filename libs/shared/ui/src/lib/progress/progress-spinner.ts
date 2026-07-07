import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Indeterminate loading spinner. Derived from current `p-progress-spinner`
 * call sites, which only ever customize size (via host `[style]` width/height)
 * — there is no determinate/value usage in the codebase.
 */
@Component({
  selector: 'sbb-progress-spinner',
  templateUrl: './progress-spinner.html',
  styleUrl: './progress-spinner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'progressbar',
    'aria-label': 'Loading',
    '[style.--sbb-progress-spinner-size.rem]': 'size()',
  },
})
export class SbbProgressSpinner {
  /** Diameter of the spinner in rem. Defaults to the current 1.3rem call sites. */
  readonly size = input<number>(1.3);
}
