import { moduleMetadata } from '@storybook/angular-vite';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { SbbPopover } from '../popover';
import type { SbbMenuItem } from '../menu';
import { SbbContextMenu } from './context-menu.component';

/**
 * Stories for `SbbContextMenu` — a right-click menu (embedded native-popover
 * `SbbMenu`) wrapping arbitrary content.
 *
 * iframe.html?id=shared-ui-context-menu--default&globals=theme:dark
 */
const model: SbbMenuItem<string>[] = [
  { label: 'Refresh', onSelect: () => undefined },
  { label: 'Rename', onSelect: () => undefined },
  { separator: true },
  { label: 'Delete', onSelect: () => undefined },
];

const meta: Meta<SbbContextMenu<string>> = {
  title: 'Shared UI/Context Menu',
  component: SbbContextMenu,
  args: { model, data: 'queue-1' },
  render: (args) => ({
    props: args,
    template: `<sbb-context-menu [model]="model" [data]="data">
      <div style="padding: 2rem; border: 1px dashed var(--sbb-border); border-radius: var(--sbb-radius)">
        Right-click me
      </div>
    </sbb-context-menu>`,
  }),
};

export default meta;
type Story = StoryObj<SbbContextMenu<string>>;

export const Default: Story = {};

/**
 * Regression: a context menu whose trigger sits *inside* an `SbbPopover`.
 * Right-clicking opens the menu as a nested native popover; choosing an item
 * must NOT light-dismiss the surrounding popover.
 */
export const InsidePopover: Story = {
  decorators: [moduleMetadata({ imports: [SbbPopover] })],
  render: (args) => ({
    props: args,
    template: `
      <button type="button" #trigger (click)="pop.toggle(trigger)">Open popover</button>
      <sbb-popover #pop>
        <div style="width: 18rem; padding: 1rem">
          <sbb-context-menu [model]="model" [data]="data">
            <div style="padding: 1.5rem; border: 1px dashed var(--sbb-border); border-radius: var(--sbb-radius)">
              Right-click me
            </div>
          </sbb-context-menu>
        </div>
      </sbb-popover>`,
  }),
};
