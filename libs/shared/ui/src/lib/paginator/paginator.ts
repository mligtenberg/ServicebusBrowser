import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { SbbButton } from '../button';
import {
  faAngleLeft,
  faAngleRight,
  faAnglesLeft,
  faAnglesRight,
} from '@fortawesome/free-solid-svg-icons';

/**
 * `SbbPaginator` — first/previous/next/last navigation over a record count.
 *
 * Deliberately minimal: no page-size selector, no numbered page buttons. Its
 * one job is to chunk a dataset too large for a single virtual-scroll viewport
 * (see `SbbDataGrid`), where the useful controls are "step a page" and "jump to
 * an end", and where a numbered strip would run to seven pages of buttons.
 *
 * `page` is zero-based and two-way bindable. The component clamps every
 * navigation to `[0, pageCount - 1]` itself, so a host can bind a plain signal
 * without re-validating.
 *
 * ```html
 * <sbb-paginator [totalRecords]="700000" [pageSize]="100000" [(page)]="pageIndex" />
 * ```
 */
@Component({
  selector: 'sbb-paginator',
  imports: [SbbButton, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './paginator.html',
  styleUrl: './paginator.scss',
})
export class SbbPaginator {
  /** Total records across all pages. */
  readonly totalRecords = input.required<number>();

  /** Records per page. Values below 1 are treated as 1. */
  readonly pageSize = input.required<number>();

  /** Current zero-based page index. Two-way bindable. */
  readonly page = model<number>(0);

  /** Accessible name for the navigation landmark. */
  readonly label = input<string>('Pagination');

  protected readonly faAnglesLeft = faAnglesLeft;
  protected readonly faAngleLeft = faAngleLeft;
  protected readonly faAngleRight = faAngleRight;
  protected readonly faAnglesRight = faAnglesRight;

  /** Total number of pages (at least 1, so the label never reads "of 0"). */
  readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.totalRecords() / this.effectivePageSize())),
  );

  /** Zero-based index of the first record on the current page. */
  readonly firstRecordIndex = computed(
    () => this.clampedPage() * this.effectivePageSize(),
  );

  /**
   * Exclusive end index of the current page, capped at {@link totalRecords} so
   * the last page reports its real (short) extent.
   */
  readonly lastRecordIndex = computed(() =>
    Math.min(
      this.firstRecordIndex() + this.effectivePageSize(),
      this.totalRecords(),
    ),
  );

  /** `page` clamped into range — guards a host that set it out of bounds. */
  protected readonly clampedPage = computed(() =>
    Math.min(Math.max(this.page(), 0), this.pageCount() - 1),
  );

  protected readonly isFirstPage = computed(() => this.clampedPage() === 0);
  protected readonly isLastPage = computed(
    () => this.clampedPage() >= this.pageCount() - 1,
  );

  private readonly effectivePageSize = computed(() =>
    Math.max(1, Math.floor(this.pageSize())),
  );

  protected goTo(page: number): void {
    const next = Math.min(Math.max(page, 0), this.pageCount() - 1);
    if (next !== this.page()) {
      this.page.set(next);
    }
  }

  protected first(): void {
    this.goTo(0);
  }

  protected previous(): void {
    this.goTo(this.clampedPage() - 1);
  }

  protected next(): void {
    this.goTo(this.clampedPage() + 1);
  }

  protected last(): void {
    this.goTo(this.pageCount() - 1);
  }
}
