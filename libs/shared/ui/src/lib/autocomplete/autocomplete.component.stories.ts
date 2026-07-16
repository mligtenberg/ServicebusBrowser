import { moduleMetadata } from '@storybook/angular-vite';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';
import { SbbPopover } from '../popover';
import { SbbAutocomplete } from './autocomplete.component';

/**
 * Stories for `SbbAutocomplete`. Suggestions are passed statically here (a real
 * call site filters them in response to `(completeChange)`), which is enough to
 * exercise the panel open/select/dismiss behaviour.
 *
 * Story ids follow the title: `Shared UI/Autocomplete` ->
 *   iframe.html?id=shared-ui-autocomplete--default&globals=theme:dark
 */
const suggestions = ['alpha', 'beta', 'gamma', 'delta'];

const meta: Meta<SbbAutocomplete<string>> = {
  title: 'Shared UI/Autocomplete',
  component: SbbAutocomplete,
  tags: ['autodocs'],
  args: {
    suggestions,
    placeholder: 'Type to search…',
  },
  render: (args) => ({
    props: args,
    template: `<div style="width: 16rem">
      <sbb-autocomplete
        [suggestions]="suggestions"
        [placeholder]="placeholder"
      ></sbb-autocomplete>
    </div>`,
  }),
};

export default meta;
type Story = StoryObj<SbbAutocomplete<string>>;

export const Default: Story = {};

/**
 * Type into the input to open the suggestion panel, select an option, and
 * confirm the input reflects the selection and the panel closes.
 */
export const SelectSuggestion: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox');

    await userEvent.type(input, 'be');

    const option = await canvas.findByRole('option', { name: 'beta' });
    // The panel is a native popover with a `sbb-fade-in` opacity animation on
    // open; `toBeVisible` reads opacity synchronously, so wait for it to settle.
    await waitFor(() => expect(option).toBeVisible());
    expect(canvas.getByRole('option', { name: 'alpha' })).toBeVisible();

    await fireEvent.click(option);

    await waitFor(() => expect(input).toHaveValue('beta'));
    await waitFor(() =>
      expect(canvas.queryByRole('listbox')).not.toBeInTheDocument(),
    );
  },
};

/**
 * Regression: an autocomplete rendered *inside* an `SbbPopover`. Its suggestion
 * panel is a nested native popover, so picking a suggestion must NOT
 * light-dismiss the surrounding popover. Open the popover, type, and click a
 * suggestion — the popover stays open.
 */
export const InsidePopover: Story = {
  decorators: [moduleMetadata({ imports: [SbbPopover] })],
  render: (args) => ({
    props: args,
    template: `
      <button type="button" #trigger (click)="pop.toggle(trigger)">Open popover</button>
      <sbb-popover #pop>
        <div style="width: 16rem; padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem">
          <span>Search inside the popover:</span>
          <sbb-autocomplete
            [suggestions]="suggestions"
            [placeholder]="placeholder"
          ></sbb-autocomplete>
        </div>
      </sbb-popover>`,
  }),
};
