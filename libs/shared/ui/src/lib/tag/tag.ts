import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SbbTagSeverity } from './tag.models';

/**
 * `SbbTag` — a small pill/badge for display of a short label or value.
 *
 * Opinionated-minimal API distilled from the current `p-tag` call sites
 * across the app (`message-filter-editor`): a projected text/value with a
 * severity color. All current call sites use the default severity, so
 * `severity` defaults to `'secondary'` — a neutral pill — while still
 * supporting the full `p-tag` severity palette for future call sites.
 *
 * Pure display — no inputs/outputs beyond `severity`, no interactivity.
 *
 * Usage:
 * ```html
 * <sbb-tag>{{ value() }}</sbb-tag>
 * <sbb-tag severity="danger">Error</sbb-tag>
 * ```
 */
@Component({
  selector: 'sbb-tag',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tag.html',
  styleUrl: './tag.scss',
  host: {
    class: 'sbb-tag-host',
  },
})
export class SbbTag {
  /** Visual intent. Defaults to `'secondary'` (neutral pill). */
  readonly severity = input<SbbTagSeverity>('secondary');

  protected readonly tagClasses = computed(() => ({
    'sbb-tag': true,
    [`sbb-tag--${this.severity()}`]: true,
  }));
}
