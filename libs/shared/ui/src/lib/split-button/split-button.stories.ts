import type { Meta, StoryObj } from '@storybook/angular-vite';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { expect, fireEvent, fn, waitFor, within } from 'storybook/test';
import type { SbbMenuItem } from '../menu';
import { SbbSplitButton } from './split-button';

/**
 * Stories for `SbbSplitButton` — a primary action joined to a caret that opens
 * a dropdown (an embedded native-popover `SbbMenu`).
 *
 * iframe.html?id=shared-ui-split-button--default&globals=theme:dark
 */
const onClicked = fn();
const onSendAll = fn();
const model: SbbMenuItem<void>[] = [
  { label: 'Send selection', onSelect: () => undefined },
  { label: 'Send all', onSelect: onSendAll },
  { separator: true },
  { label: 'Schedule…', onSelect: () => undefined },
];

const meta: Meta<SbbSplitButton> = {
  title: 'Shared UI/Split Button',
  component: SbbSplitButton,
  args: { label: 'Send batch', icon: faPaperPlane, model, disabled: false },
  render: (args) => ({
    props: { ...args, onClicked },
    template: `<sbb-split-button
      [label]="label"
      [icon]="icon"
      [model]="model"
      [disabled]="disabled"
      (clicked)="onClicked()"
    ></sbb-split-button>`,
  }),
};

export default meta;
type Story = StoryObj<SbbSplitButton>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await fireEvent.click(canvas.getByRole('button', { name: 'Send batch' }));
    await expect(onClicked).toHaveBeenCalledOnce();

    const toggleButton = canvas.getByRole('button', { name: 'More actions' });
    await fireEvent.click(toggleButton);
    const sendAllItem = await canvas.findByRole('menuitem', { name: 'Send all' });
    // The dropdown panel runs a `sbb-fade-in` opacity animation on open;
    // `toBeVisible` reads opacity synchronously, so wait for it to settle.
    await waitFor(() => expect(sendAllItem).toBeVisible());

    await fireEvent.click(sendAllItem);
    await expect(onSendAll).toHaveBeenCalledOnce();
    // The menu panel is conditionally rendered (`@if (isOpen())`); after
    // choosing an item it closes and the item is removed from the DOM.
    await waitFor(() =>
      expect(canvas.queryByRole('menuitem', { name: 'Send all' })).not.toBeInTheDocument(),
    );
  },
};
