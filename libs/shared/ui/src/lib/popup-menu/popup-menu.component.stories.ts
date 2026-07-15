import { moduleMetadata } from '@storybook/angular-vite';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { SbbPopover } from '../popover';
import type { SbbMenuItem } from '../menu';
import { SbbMenu } from './popup-menu.component';

/**
 * Stories for `SbbMenu` — an imperatively-opened popup menu. Open it from a
 * trigger via `menu.open($event)`.
 *
 * Story ids follow the title: `Shared UI/Menu` ->
 *   iframe.html?id=shared-ui-menu--default&globals=theme:dark
 */
const model: SbbMenuItem<void>[] = [
  { label: 'Refresh', onSelect: () => undefined },
  { label: 'Duplicate', onSelect: () => undefined },
  { separator: true },
  { label: 'Delete', onSelect: () => undefined },
];

const meta: Meta<SbbMenu<void>> = {
  title: 'Shared UI/Menu',
  component: SbbMenu,
  args: { model },
  render: (args) => ({
    props: args,
    template: `
      <button type="button" (click)="menu.open($event)">Actions ▾</button>
      <sbb-menu #menu [model]="model" />`,
  }),
};

export default meta;
type Story = StoryObj<SbbMenu<void>>;

export const Default: Story = {};

/**
 * Regression: a menu opened *inside* an `SbbPopover`. Its panel is a nested
 * native popover, so choosing an item must NOT light-dismiss the surrounding
 * popover. Open the popover, open the menu, click an item — the popover stays
 * open (the item's action still runs and the menu closes).
 */
export const InsidePopover: Story = {
  decorators: [moduleMetadata({ imports: [SbbPopover] })],
  render: (args) => ({
    props: args,
    template: `
      <button type="button" #trigger (click)="pop.toggle(trigger)">Open popover</button>
      <sbb-popover #pop>
        <div style="width: 16rem; padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-start">
          <span>Menu inside the popover:</span>
          <button type="button" (click)="menu.open($event)">Actions ▾</button>
          <sbb-menu #menu [model]="model" />
        </div>
      </sbb-popover>`,
  }),
};
