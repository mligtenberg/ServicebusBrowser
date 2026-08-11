import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect } from 'storybook/test';
import { SbbDataGrid } from './data-grid';
import { SbbColumn } from './data-grid.models';

type Row = { seq: number; id: string; subject: string };

const COLUMNS: SbbColumn<Row>[] = [
  { field: 'seq', header: 'Sequence' },
  { field: 'id', header: 'Id' },
  { field: 'subject', header: 'Subject' },
];

const ROW_HEIGHT = 42;
const TOTAL = 700_000;

const meta: Meta<SbbDataGrid<Row>> = {
  title: 'Shared UI/Data Grid',
  component: SbbDataGrid,
};

export default meta;

/** Row `seq` values currently in the DOM, in render order. */
function renderedSequences(): number[] {
  const wrapper = document.querySelector('.cdk-virtual-scroll-content-wrapper');
  return [...(wrapper?.children ?? [])].map((row) =>
    Number(row.textContent?.trim().split(/\s+/)[0]),
  );
}

function viewport(): HTMLElement {
  return document.querySelector('cdk-virtual-scroll-viewport') as HTMLElement;
}

/** Scroll to the very bottom and let the strategy settle. */
async function scrollToBottom(): Promise<void> {
  const vp = viewport();
  for (let i = 0; i < 3; i++) {
    vp.scrollTop = vp.scrollHeight;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
}

/**
 * A 700k-row grid whose container is resized *without* a window resize — the
 * shape a splitter drag produces in the messages viewer.
 *
 * Regression guard for two defects that made the last handful of rows
 * unreachable:
 *
 *  1. CDK only re-measures the viewport on window resize, so growing the
 *     container left a stale (smaller) viewport size behind and the strategy's
 *     rendered range stopped short of the data length.
 *  2. Rows rendered 1px taller than `rowHeight` (bottom border + content-box),
 *     drifting the rendered window down and clipping its last row.
 */
export const LastRowsReachableAfterResize: StoryObj<SbbDataGrid<Row>> = {
  render: () => ({
    props: {
      columns: COLUMNS,
      data: Array.from({ length: TOTAL }, (_, i) => ({
        seq: i,
        id: `id-${i}`,
        subject: `subject ${i}`,
      })),
      rowHeight: ROW_HEIGHT,
    },
    template: `<div class="resize-host" style="height: 400px">
        <sbb-data-grid [columns]="columns" [data]="data" [rowHeight]="rowHeight" />
      </div>`,
  }),
  play: async () => {
    const host = document.querySelector('.resize-host') as HTMLElement;

    // Every row's outer height must match what the scroll strategy assumes,
    // otherwise the rendered window drifts away from its computed offset.
    const firstRow = document.querySelector('.sbb-grid__row') as HTMLElement;
    expect(firstRow.getBoundingClientRect().height).toBe(ROW_HEIGHT);

    for (const height of [400, 900, 1600]) {
      host.style.height = `${height}px`;
      await scrollToBottom();

      const vp = viewport();
      const sequences = renderedSequences();

      // The final row must be rendered...
      expect(sequences).toContain(TOTAL - 1);

      // ...and fully inside the viewport, not clipped past its bottom edge.
      const last = [...(document.querySelector('.cdk-virtual-scroll-content-wrapper')?.children ?? [])].at(-1) as HTMLElement;
      const offsetFromTop =
        last.getBoundingClientRect().bottom - vp.getBoundingClientRect().top;
      expect(offsetFromTop).toBeLessThanOrEqual(vp.clientHeight + 1);
    }
  },
};
