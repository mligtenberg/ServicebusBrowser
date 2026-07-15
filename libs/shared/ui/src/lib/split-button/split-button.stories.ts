import type { Meta, StoryObj } from '@storybook/angular-vite';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import type { SbbMenuItem } from '../menu';
import { SbbSplitButton } from './split-button';

/**
 * Stories for `SbbSplitButton` — a primary action joined to a caret that opens
 * a dropdown (an embedded native-popover `SbbMenu`).
 *
 * iframe.html?id=shared-ui-split-button--default&globals=theme:dark
 */
const model: SbbMenuItem<void>[] = [
  { label: 'Send selection', onSelect: () => undefined },
  { label: 'Send all', onSelect: () => undefined },
  { separator: true },
  { label: 'Schedule…', onSelect: () => undefined },
];

const meta: Meta<SbbSplitButton> = {
  title: 'Shared UI/Split Button',
  component: SbbSplitButton,
  args: { label: 'Send batch', icon: faPaperPlane, model, disabled: false },
  render: (args) => ({
    props: args,
    template: `<sbb-split-button
      [label]="label"
      [icon]="icon"
      [model]="model"
      [disabled]="disabled"
    ></sbb-split-button>`,
  }),
};

export default meta;
type Story = StoryObj<SbbSplitButton>;

export const Default: Story = {};
