import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { expect, fireEvent, waitFor, within } from 'storybook/test';
import { SbbSplitter } from './splitter.component';
import { SbbSplitterPanel } from './splitter-panel.component';

/**
 * Stories for `SbbSplitter`/`SbbSplitterPanel`. Drag a gutter (or focus it and
 * use the arrow keys) to resize the adjacent panes.
 *
 * Story ids follow the title: `Shared UI/Splitter` -> `shared-ui-splitter--horizontal`.
 */
const meta: Meta<SbbSplitter> = {
  title: 'Shared UI/Splitter',
  component: SbbSplitter,
  decorators: [moduleMetadata({ imports: [SbbSplitterPanel] })],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<SbbSplitter>;

export const Horizontal: Story = {
  render: () => ({
    template: `
      <div style="display: flex; height: 16rem; border: 1px solid #cbd5e1">
        <sbb-splitter orientation="horizontal">
          <sbb-splitter-panel [size]="60" [minSize]="20">
            <div style="width: 100%; height: 100%; box-sizing: border-box; padding: 1rem">Left (60%, min 20%)</div>
          </sbb-splitter-panel>
          <sbb-splitter-panel [size]="40" [minSize]="10">
            <div style="width: 100%; height: 100%; box-sizing: border-box; padding: 1rem">Right (40%, min 10%)</div>
          </sbb-splitter-panel>
        </sbb-splitter>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const panels = canvasElement.querySelectorAll('sbb-splitter-panel');
    const handle = canvas.getByRole('separator');

    await waitFor(() => expect(panels[0]).toHaveAttribute('data-panel-size', '60'));

    handle.focus();
    await fireEvent.keyDown(handle, { key: 'ArrowRight' });

    await waitFor(() => expect(panels[0]).toHaveAttribute('data-panel-size', '61'));
    expect(panels[1]).toHaveAttribute('data-panel-size', '39');
  },
};

export const Vertical: Story = {
  render: () => ({
    template: `
      <div style="display: flex; height: 20rem; border: 1px solid #cbd5e1">
        <sbb-splitter orientation="vertical">
          <sbb-splitter-panel [size]="30" [minSize]="10">
            <div style="width: 100%; height: 100%; box-sizing: border-box; padding: 1rem">Top (30%)</div>
          </sbb-splitter-panel>
          <sbb-splitter-panel [size]="70" [minSize]="10">
            <div style="width: 100%; height: 100%; box-sizing: border-box; padding: 1rem">Bottom (70%)</div>
          </sbb-splitter-panel>
        </sbb-splitter>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const panels = canvasElement.querySelectorAll('sbb-splitter-panel');
    const handle = canvas.getByRole('separator');

    await waitFor(() => expect(panels[0]).toHaveAttribute('data-panel-size', '30'));

    handle.focus();
    await fireEvent.keyDown(handle, { key: 'ArrowDown', shiftKey: true });

    await waitFor(() => expect(panels[0]).toHaveAttribute('data-panel-size', '40'));
    expect(panels[1]).toHaveAttribute('data-panel-size', '60');
  },
};

export const ThreePanels: Story = {
  render: () => ({
    template: `
      <div style="display: flex; height: 16rem; border: 1px solid #cbd5e1">
        <sbb-splitter orientation="horizontal">
          <sbb-splitter-panel [size]="25" [minSize]="10">
            <div style="width: 100%; height: 100%; box-sizing: border-box; padding: 1rem">A (25%)</div>
          </sbb-splitter-panel>
          <sbb-splitter-panel [size]="50" [minSize]="10">
            <div style="width: 100%; height: 100%; box-sizing: border-box; padding: 1rem">B (50%)</div>
          </sbb-splitter-panel>
          <sbb-splitter-panel [size]="25" [minSize]="10">
            <div style="width: 100%; height: 100%; box-sizing: border-box; padding: 1rem">C (25%)</div>
          </sbb-splitter-panel>
        </sbb-splitter>
      </div>`,
  }),
};
