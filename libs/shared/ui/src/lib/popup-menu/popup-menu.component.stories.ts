import { moduleMetadata } from '@storybook/angular-vite';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect, fireEvent, fn, waitFor, within } from 'storybook/test';
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
const onRefreshSelect = fn();
const model: SbbMenuItem<void>[] = [
  { label: 'Refresh', onSelect: onRefreshSelect },
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

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    onRefreshSelect.mockClear();

    await fireEvent.click(canvas.getByRole('button', { name: 'Actions ▾' }));
    const refreshItem = await canvas.findByRole('menuitem', { name: 'Refresh' });
    // The panel runs a `sbb-fade-in` opacity animation on open; `toBeVisible`
    // reads opacity synchronously, so wait for it to settle.
    await waitFor(() => expect(refreshItem).toBeVisible());
    // Opening moves roving focus to the first item.
    await waitFor(() => expect(document.activeElement).toBe(refreshItem));

    const duplicateItem = canvas.getByRole('menuitem', { name: 'Duplicate' });
    await fireEvent.keyDown(refreshItem, { key: 'ArrowDown' });
    await waitFor(() => expect(document.activeElement).toBe(duplicateItem));

    await fireEvent.click(refreshItem);
    expect(onRefreshSelect).toHaveBeenCalledTimes(1);
    // The panel unmounts entirely once closed (`@if (isOpen())` in the template).
    await waitFor(() =>
      expect(
        canvas.queryByRole('menuitem', { name: 'Refresh' }),
      ).not.toBeInTheDocument(),
    );
  },
};

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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    onRefreshSelect.mockClear();

    await fireEvent.click(canvas.getByRole('button', { name: 'Open popover' }));
    const menuTrigger = await canvas.findByRole('button', { name: 'Actions ▾' });
    await waitFor(() => expect(menuTrigger).toBeVisible());

    await fireEvent.click(menuTrigger);
    const refreshItem = await canvas.findByRole('menuitem', { name: 'Refresh' });
    await waitFor(() => expect(refreshItem).toBeVisible());

    await fireEvent.click(refreshItem);
    expect(onRefreshSelect).toHaveBeenCalledTimes(1);

    // Regression: choosing a menu item must not light-dismiss the
    // surrounding popover (see the class doc on SbbMenu re: nested
    // native-popover ancestry).
    await waitFor(() =>
      expect(canvas.getByText('Menu inside the popover:')).toBeVisible(),
    );
    await waitFor(() =>
      expect(
        canvas.queryByRole('menuitem', { name: 'Refresh' }),
      ).not.toBeInTheDocument(),
    );
  },
};
