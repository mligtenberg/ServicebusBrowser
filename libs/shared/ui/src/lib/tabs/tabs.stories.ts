import { signal } from '@angular/core';
import { moduleMetadata } from '@storybook/angular-vite';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect, fireEvent, waitFor, within } from 'storybook/test';
import { SbbTabs, SbbTabsReorderEvent } from './tabs.component';
import { SbbTabPanel } from './tab-panel.component';
import { SbbTabHeaderDef } from './tab-header.directive';

/**
 * Stories for `SbbTabs` — a tab strip switching between projected
 * `SbbTabPanel` content regions.
 *
 * Story ids follow the title: `Shared UI/Tabs` -> `shared-ui-tabs--default`,
 * so an agent can navigate straight to e.g.
 *   iframe.html?id=shared-ui-tabs--default&globals=theme:dark
 */
const meta: Meta<SbbTabs> = {
  title: 'Shared UI/Tabs',
  component: SbbTabs,
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
  },
  args: { orientation: 'horizontal' },
  decorators: [moduleMetadata({ imports: [SbbTabPanel] })],
  render: (args) => ({
    props: args,
    template: `<sbb-tabs [orientation]="orientation">
      <sbb-tab-panel value="details" label="Details">
        <p>Details content.</p>
      </sbb-tab-panel>
      <sbb-tab-panel value="headers" label="Headers">
        <p>Headers content.</p>
      </sbb-tab-panel>
      <sbb-tab-panel value="properties" label="Properties" [disabled]="true">
        <p>Properties content (disabled tab).</p>
      </sbb-tab-panel>
    </sbb-tabs>`,
  }),
};

export default meta;
type Story = StoryObj<SbbTabs>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const detailsTab = canvas.getByRole('tab', { name: 'Details' });
    const headersTab = canvas.getByRole('tab', { name: 'Headers' });
    await waitFor(() => expect(detailsTab).toHaveAttribute('aria-selected', 'true'));
    expect(canvas.getByText('Details content.')).toBeVisible();

    await fireEvent.click(headersTab);
    await waitFor(() => expect(headersTab).toHaveAttribute('aria-selected', 'true'));
    expect(detailsTab).toHaveAttribute('aria-selected', 'false');
    expect(canvas.getByText('Headers content.')).toBeVisible();
    expect(canvas.getByText('Details content.')).not.toBeVisible();

    await fireEvent.keyDown(headersTab, { key: 'ArrowRight' });
    // The next enabled tab wraps past the disabled "Properties" tab back to "Details".
    await waitFor(() => expect(detailsTab).toHaveAttribute('aria-selected', 'true'));
    expect(canvas.getByText('Details content.')).toBeVisible();

    const propertiesTab = canvas.getByRole('tab', { name: 'Properties' });
    expect(propertiesTab).toBeDisabled();
    await fireEvent.click(propertiesTab);
    expect(detailsTab).toHaveAttribute('aria-selected', 'true');
  },
};

export const Vertical: Story = {
  args: { orientation: 'vertical' },
};

/**
 * `reorderable` turns on drag-to-reorder of the tab strip (Angular CDK
 * drag-drop under the hood). `SbbTabs` only emits `(reordered)` with the
 * moved indices — it doesn't own the panels' backing array, so this story
 * applies the move itself, the same way a real consumer (e.g. the app's
 * page navigator) would.
 *
 * Dragging depends on real layout/pointer geometry that jsdom can't provide,
 * so this story is for manual exploration in the browser rather than an
 * automated `play` assertion — drag "Headers" left past "Details" and
 * confirm the strip reorders and stays reordered after the drop.
 */
export const Reorderable: Story = {
  args: { orientation: 'horizontal' },
  render: (args) => {
    const tabs = signal([
      { value: 'details', label: 'Details' },
      { value: 'headers', label: 'Headers' },
      { value: 'properties', label: 'Properties' },
    ]);

    return {
      props: {
        ...args,
        tabs,
        onReordered: ({ previousIndex, currentIndex }: SbbTabsReorderEvent) => {
          const next = [...tabs()];
          const [moved] = next.splice(previousIndex, 1);
          next.splice(currentIndex, 0, moved);
          tabs.set(next);
        },
      },
      template: `<sbb-tabs [orientation]="orientation" [reorderable]="true" (reordered)="onReordered($event)">
        @for (tab of tabs(); track tab.value) {
          <sbb-tab-panel [value]="tab.value" [label]="tab.label">
            <p>{{ tab.label }} content.</p>
          </sbb-tab-panel>
        }
      </sbb-tabs>`,
    };
  },
};

/**
 * A panel projecting `<ng-template sbbTabHeader>` renders as a `role="tab"`
 * `<div>` instead of a `<button>`, so its header can hold other interactive
 * elements — here, a close button that stops the click from also selecting
 * the tab it's about to remove.
 */
export const CustomHeader: Story = {
  // A custom-header tab hosts genuinely interactive content (a close button
  // here; a rename input, close/accept/cancel buttons, links and a context
  // menu in the real `page-navigator` consumer). That collides irreconcilably
  // with two axe rules under the WAI-ARIA tabs pattern:
  //   - `nested-interactive`   — a `role="tab"` must not contain focusable
  //                              controls (a <button> counts even at
  //                              tabindex="-1"); and
  //   - `aria-required-children` — a `role="tablist"` may only own `role="tab"`
  //                              children, so those controls can't sit in the
  //                              tablist either.
  // There is no DOM structure that keeps strict tab/tablist roles AND allows
  // interactive header content, so we knowingly suppress just these two rules
  // for this variant (plain-text tabs keep full, unmodified a11y coverage). The
  // projected content supplies its own semantics (labelled buttons, links).
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: 'nested-interactive', enabled: false },
          { id: 'aria-required-children', enabled: false },
        ],
      },
    },
  },
  decorators: [moduleMetadata({ imports: [SbbTabPanel, SbbTabHeaderDef] })],
  render: () => ({
    template: `<sbb-tabs>
      <sbb-tab-panel value="details" label="Details">
        <ng-template sbbTabHeader>
          <span>Details</span>
          <button type="button" class="close-button" (click)="$event.stopPropagation()">&times;</button>
        </ng-template>
        <p>Details content.</p>
      </sbb-tab-panel>
      <sbb-tab-panel value="headers" label="Headers">
        <ng-template sbbTabHeader>
          <span>Headers</span>
          <button type="button" class="close-button" (click)="$event.stopPropagation()">&times;</button>
        </ng-template>
        <p>Headers content.</p>
      </sbb-tab-panel>
    </sbb-tabs>
    <style>.close-button { margin-left: 0.5rem; }</style>`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const detailsTab = canvas.getByRole('tab', { name: 'Details' });
    expect(detailsTab.tagName).toBe('DIV');
    await waitFor(() => expect(detailsTab).toHaveAttribute('aria-selected', 'true'));

    const headersTab = canvas.getByRole('tab', { name: 'Headers' });
    // The header's own controls are siblings of the (empty) focusable tab
    // element, not descendants of it — nesting a focusable control inside the
    // `role="tab"` element is invalid ("nested-interactive"). Reach the close
    // button through the presentation wrapper the two share.
    const headersCloseButton = within(headersTab.parentElement as HTMLElement).getByRole('button');
    await fireEvent.click(headersCloseButton);
    // Clicking the close button must not also select the "Headers" tab.
    expect(detailsTab).toHaveAttribute('aria-selected', 'true');

    await fireEvent.click(headersTab);
    await waitFor(() => expect(headersTab).toHaveAttribute('aria-selected', 'true'));
  },
};
