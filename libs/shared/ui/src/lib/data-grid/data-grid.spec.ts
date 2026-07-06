import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SbbDataGrid } from './data-grid';
import { SbbColumn, SbbLazyLoadEvent, SbbSortState } from './data-grid.models';

interface Row {
  id: number;
  name: string;
  score: number;
}

function makeRows(count: number): Row[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `row-${String(i).padStart(4, '0')}`,
    score: (count - i) % 97,
  }));
}

const COLUMNS: SbbColumn<Row>[] = [
  { field: 'id', header: 'Id' },
  { field: 'name', header: 'Name' },
  { field: 'score', header: 'Score' },
];

@Component({
  imports: [SbbDataGrid],
  template: `
    <div style="height: 300px">
      <sbb-data-grid
        [columns]="columns()"
        [data]="data()"
        [selectionMode]="selectionMode()"
        [lazy]="lazy()"
        [totalRecords]="totalRecords()"
        [rowHeight]="rowHeight()"
        [lazyLoadThreshold]="threshold()"
        [trackBy]="trackById"
        [(selection)]="selection"
        (sortChange)="lastSort = $event"
        (lazyLoad)="lazyEvents.push($event)"
      />
    </div>
  `,
})
class HostComponent {
  grid = viewChild.required(SbbDataGrid<Row>);

  columns = signal<SbbColumn<Row>[]>(COLUMNS);
  data = signal<ReadonlyArray<Row>>(makeRows(1000));
  selectionMode = signal<'none' | 'single' | 'multiple'>('single');
  lazy = signal(false);
  totalRecords = signal<number | undefined>(undefined);
  rowHeight = signal(42);
  threshold = signal(20);
  selection = signal<ReadonlyArray<unknown>>([]);

  lastSort: SbbSortState | null = null;
  lazyEvents: SbbLazyLoadEvent[] = [];

  trackById = (row: Row) => row.id;
}

// jsdom gives elements zero geometry and no scrollTo, so the CDK virtual
// scroll viewport can neither measure itself nor render a window. We give the
// viewport element a real, fixed geometry (300px tall) and a scrollTo stub that
// updates scrollTop, matching how a browser drives the scroll strategy. This is
// the standard technique for exercising cdk-virtual-scroll-viewport under jest.
const VIEWPORT_HEIGHT = 300;

function patchViewportGeometry(): () => void {
  const viewportEls = new WeakSet<Element>();

  const origRect = Element.prototype.getBoundingClientRect;
  const origScrollTo = Element.prototype.scrollTo;

  const heightDesc = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'clientHeight',
  );
  const widthDesc = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'clientWidth',
  );

  function isViewport(el: Element): boolean {
    if (el.classList?.contains('cdk-virtual-scroll-viewport')) {
      viewportEls.add(el);
      return true;
    }
    return viewportEls.has(el);
  }

  Element.prototype.getBoundingClientRect = function (this: Element) {
    if (isViewport(this)) {
      return {
        width: 600,
        height: VIEWPORT_HEIGHT,
        top: 0,
        left: 0,
        right: 600,
        bottom: VIEWPORT_HEIGHT,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      } as DOMRect;
    }
    return origRect.call(this);
  };

  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    get(this: HTMLElement) {
      return isViewport(this) ? VIEWPORT_HEIGHT : 0;
    },
  });
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get(this: HTMLElement) {
      return isViewport(this) ? 600 : 0;
    },
  });

  Element.prototype.scrollTo = function (this: Element, ...args: unknown[]) {
    const opts = args[0];
    if (opts && typeof opts === 'object' && 'top' in opts) {
      this.scrollTop = (opts as { top: number }).top;
      this.dispatchEvent(new Event('scroll'));
    }
  } as typeof Element.prototype.scrollTo;

  return () => {
    Element.prototype.getBoundingClientRect = origRect;
    Element.prototype.scrollTo = origScrollTo;
    if (heightDesc) Object.defineProperty(HTMLElement.prototype, 'clientHeight', heightDesc);
    if (widthDesc) Object.defineProperty(HTMLElement.prototype, 'clientWidth', widthDesc);
  };
}

// Drive the viewport to a given item index deterministically under jsdom:
// set the scroll offset, notify the strategy, and let it recompute the
// rendered range + emit scrolledIndexChange (which our component listens to).
function scrollTo(
  vp: import('@angular/cdk/scrolling').CdkVirtualScrollViewport,
  index: number,
): void {
  vp.scrollToIndex(index, 'auto');
  // jsdom does not run the throttled scroll pipeline, so poke the strategy
  // the same way an emitted DOM scroll event would.
  const strategy = vp['_scrollStrategy'] as { onContentScrolled(): void };
  strategy.onContentScrolled();
}

describe('SbbDataGrid', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let restoreGeometry: () => void;

  async function setup(mutate?: (h: HostComponent) => void) {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    mutate?.(host);
    fixture.detectChanges();
    await fixture.whenStable();
    // Let the viewport measure itself now that geometry is patched.
    host.grid()['viewport']()?.checkViewportSize();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    restoreGeometry = patchViewportGeometry();
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();
  });

  afterEach(() => {
    restoreGeometry?.();
  });

  function viewport(): import('@angular/cdk/scrolling').CdkVirtualScrollViewport {
    const vp = host.grid()['viewport']();
    if (!vp) {
      throw new Error('viewport not rendered');
    }
    return vp;
  }

  function renderedRows(): HTMLElement[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll('.sbb-grid__row'),
    ) as HTMLElement[];
  }

  it('renders only a window of rows for a large dataset (virtual scroll)', async () => {
    await setup();
    const total = host.data().length;
    const rendered = renderedRows().length;
    expect(total).toBe(1000);
    // Virtualization: far fewer DOM rows than data rows.
    expect(rendered).toBeGreaterThan(0);
    expect(rendered).toBeLessThan(total / 2);
  });

  it('renders header cells for each column', async () => {
    await setup();
    const headers = Array.from(
      fixture.nativeElement.querySelectorAll('.sbb-grid__hcell'),
    ).map((el) => (el as HTMLElement).textContent?.trim());
    expect(headers).toEqual(['Id', 'Name', 'Score']);
  });

  it('selects a single row on click (single mode)', async () => {
    await setup();
    renderedRows()[2].click();
    fixture.detectChanges();
    expect(host.selection()).toEqual([2]);
  });

  it('replaces selection on plain click in single mode', async () => {
    await setup();
    renderedRows()[1].click();
    fixture.detectChanges();
    renderedRows()[3].click();
    fixture.detectChanges();
    expect(host.selection()).toEqual([3]);
  });

  it('accumulates selection with ctrl/meta click in multiple mode', async () => {
    await setup((h) => h.selectionMode.set('multiple'));
    renderedRows()[0].click();
    fixture.detectChanges();
    renderedRows()[2].dispatchEvent(
      new MouseEvent('click', { ctrlKey: true, bubbles: true }),
    );
    fixture.detectChanges();
    renderedRows()[4].dispatchEvent(
      new MouseEvent('click', { metaKey: true, bubbles: true }),
    );
    fixture.detectChanges();
    expect([...host.selection()].sort((a, b) => (a as number) - (b as number))).toEqual([0, 2, 4]);
  });

  it('toggles a row off with a second ctrl click in multiple mode', async () => {
    await setup((h) => h.selectionMode.set('multiple'));
    renderedRows()[0].click();
    fixture.detectChanges();
    renderedRows()[1].dispatchEvent(
      new MouseEvent('click', { ctrlKey: true, bubbles: true }),
    );
    fixture.detectChanges();
    renderedRows()[1].dispatchEvent(
      new MouseEvent('click', { ctrlKey: true, bubbles: true }),
    );
    fixture.detectChanges();
    expect(host.selection()).toEqual([0]);
  });

  it('does not select in none mode', async () => {
    await setup((h) => h.selectionMode.set('none'));
    renderedRows()[0].click();
    fixture.detectChanges();
    expect(host.selection()).toEqual([]);
  });

  it('reflects an externally-set selection into row state', async () => {
    await setup();
    host.selection.set([5]);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    // The grid marks the row selected; the model round-trips the same value.
    expect(host.grid().selection()).toEqual([5]);
  });

  it('emits sortChange and sorts rows client-side (non-lazy)', async () => {
    await setup((h) => h.data.set(makeRows(30)));
    const nameHeader = Array.from(
      fixture.nativeElement.querySelectorAll('.sbb-grid__hcell'),
    ).find((el) => (el as HTMLElement).textContent?.trim() === 'Score') as HTMLElement;

    nameHeader.click();
    fixture.detectChanges();
    expect(host.lastSort).toEqual({ field: 'score', direction: 'asc' });

    // First rendered row should now have the smallest score.
    const firstCellText = renderedRows()[0]
      .querySelectorAll('.sbb-grid__cell')[2]
      .textContent?.trim();
    const minScore = Math.min(...host.data().map((r) => r.score));
    expect(Number(firstCellText)).toBe(minScore);
  });

  it('cycles sort asc -> desc -> unsorted', async () => {
    await setup((h) => h.data.set(makeRows(30)));
    const scoreHeader = Array.from(
      fixture.nativeElement.querySelectorAll('.sbb-grid__hcell'),
    ).find((el) => (el as HTMLElement).textContent?.trim() === 'Score') as HTMLElement;

    scoreHeader.click();
    fixture.detectChanges();
    expect(host.lastSort?.direction).toBe('asc');
    scoreHeader.click();
    fixture.detectChanges();
    expect(host.lastSort?.direction).toBe('desc');
    scoreHeader.click();
    fixture.detectChanges();
    expect(host.lastSort?.direction).toBeNull();
  });

  it('does not reorder rows client-side when lazy', async () => {
    await setup((h) => {
      h.lazy.set(true);
      h.totalRecords.set(1000);
      h.data.set(makeRows(1000));
    });
    const scoreHeader = Array.from(
      fixture.nativeElement.querySelectorAll('.sbb-grid__hcell'),
    ).find((el) => (el as HTMLElement).textContent?.trim() === 'Score') as HTMLElement;
    scoreHeader.click();
    fixture.detectChanges();
    // Sort event still emitted (host can round-trip to the server) ...
    expect(host.lastSort).toEqual({ field: 'score', direction: 'asc' });
    // ... but the first rendered row is still row id 0 (no client reorder).
    const firstId = renderedRows()[0]
      .querySelectorAll('.sbb-grid__cell')[0]
      .textContent?.trim();
    expect(Number(firstId)).toBe(0);
  });

  it('emits lazyLoad near the end of the loaded window with correct range', async () => {
    // Only 60 of 1000 rows loaded; scrolling to the end should request more.
    await setup((h) => {
      h.lazy.set(true);
      h.totalRecords.set(1000);
      h.threshold.set(20);
      h.data.set(makeRows(60));
    });

    scrollTo(viewport(), 59);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(host.lazyEvents.length).toBeGreaterThan(0);
    const ev = host.lazyEvents[host.lazyEvents.length - 1];
    expect(ev.first).toBe(60);
    expect(ev.totalRecords).toBe(1000);
    expect(ev.rows).toBe(ev.last - ev.first);
    expect(ev.last).toBeGreaterThan(ev.first);
  });

  it('does not emit lazyLoad when everything is already loaded', async () => {
    await setup((h) => {
      h.lazy.set(true);
      h.totalRecords.set(60);
      h.data.set(makeRows(60));
    });
    scrollTo(viewport(), 59);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(host.lazyEvents.length).toBe(0);
  });

  it('does not emit lazyLoad when not in lazy mode', async () => {
    await setup((h) => h.data.set(makeRows(1000)));
    scrollTo(viewport(), 500);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(host.lazyEvents.length).toBe(0);
  });

  it('clears selection via the imperative helper', async () => {
    await setup((h) => h.selectionMode.set('multiple'));
    renderedRows()[0].click();
    fixture.detectChanges();
    expect(host.selection().length).toBe(1);
    host.grid().clearSelection();
    fixture.detectChanges();
    expect(host.selection()).toEqual([]);
  });
});
