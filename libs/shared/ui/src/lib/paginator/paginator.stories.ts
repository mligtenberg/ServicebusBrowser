import { signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect, fireEvent, waitFor, within } from 'storybook/test';
import { SbbPaginator } from './paginator';

/**
 * Stories for `SbbPaginator`. Story ids follow the title:
 * `Shared UI/Paginator` -> `shared-ui-paginator--default`.
 */
const meta: Meta<SbbPaginator> = {
  title: 'Shared UI/Paginator',
  component: SbbPaginator,
  args: { totalRecords: 700_000, pageSize: 100_000 },
  render: (args) => {
    const page = signal(0);
    return {
      props: { ...args, page },
      template: `<sbb-paginator
        [totalRecords]="totalRecords"
        [pageSize]="pageSize"
        [(page)]="page" />`,
    };
  },
};

export default meta;

/**
 * Locate a control by role rather than by label: `SbbButton` puts `aria-label`
 * on both its host element and the inner native button, so a label query
 * matches twice.
 */
const control = (canvas: ReturnType<typeof within>, name: string) =>
  canvas.getByRole('button', { name });

export const Default: StoryObj<SbbPaginator> = {};

/** Stepping and jumping stays inside `[0, pageCount - 1]`. */
export const NavigationClampsToBounds: StoryObj<SbbPaginator> = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 700k / 100k = 7 pages; the backwards controls start out unreachable.
    expect(canvas.getByText(/Page 1 of 7/)).toBeTruthy();
    expect(control(canvas, 'First page')).toBeDisabled();
    expect(control(canvas, 'Previous page')).toBeDisabled();

    await fireEvent.click(control(canvas, 'Next page'));
    await waitFor(() => expect(canvas.getByText(/Page 2 of 7/)).toBeTruthy());
    expect(canvas.getByText(/100,001–200,000 of 700,000/)).toBeTruthy();

    await fireEvent.click(control(canvas, 'Last page'));
    await waitFor(() => expect(canvas.getByText(/Page 7 of 7/)).toBeTruthy());
    expect(control(canvas, 'Next page')).toBeDisabled();
    expect(control(canvas, 'Last page')).toBeDisabled();

    await fireEvent.click(control(canvas, 'First page'));
    await waitFor(() => expect(canvas.getByText(/Page 1 of 7/)).toBeTruthy());
  },
};

/** A final short page reports its real extent, not a rounded-up one. */
export const ShortLastPage: StoryObj<SbbPaginator> = {
  args: { totalRecords: 250_123, pageSize: 100_000 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fireEvent.click(control(canvas, 'Last page'));
    await waitFor(() => expect(canvas.getByText(/Page 3 of 3/)).toBeTruthy());
    expect(canvas.getByText(/200,001–250,123 of 250,123/)).toBeTruthy();
  },
};

/** Fewer records than a page: one page, every control inert. */
export const SinglePage: StoryObj<SbbPaginator> = {
  args: { totalRecords: 42, pageSize: 100_000 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/Page 1 of 1/)).toBeTruthy();
    expect(canvas.getByText(/1–42 of 42/)).toBeTruthy();
    for (const name of ['First page', 'Previous page', 'Next page', 'Last page']) {
      expect(control(canvas, name)).toBeDisabled();
    }
  },
};
