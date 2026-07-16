import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';
import { SbbPopover } from '../popover';
import { SbbSelect } from './select';
import type { SbbSelectOptions } from './select.models';

/**
 * Stories for `SbbSelect`. The trigger shows the selected label (or the
 * placeholder) with a chevron caret pinned to its right-hand side.
 *
 * Story ids follow the title: `Shared UI/Select` -> `shared-ui-select--default`,
 * so an agent can navigate straight to e.g.
 *   iframe.html?id=shared-ui-select--default&globals=theme:dark
 */
const flatOptions: SbbSelectOptions<string> = [
  { label: 'Active', value: 'active' },
  { label: 'Disabled', value: 'disabled' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Dead-lettered', value: 'dead-lettered' },
];

const groupedOptions: SbbSelectOptions<string> = [
  {
    label: 'System',
    options: [
      { label: 'Message ID', value: 'messageId' },
      { label: 'Sequence Number', value: 'sequenceNumber' },
    ],
  },
  {
    label: 'Application',
    options: [
      { label: 'Correlation ID', value: 'correlationId' },
      { label: 'Subject', value: 'subject' },
    ],
  },
];

const meta: Meta<SbbSelect<string>> = {
  title: 'Shared UI/Select',
  component: SbbSelect,
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: 'text' },
    searchable: { control: 'boolean' },
  },
  args: {
    options: flatOptions,
    placeholder: 'Select a status',
    searchable: false,
  },
  render: (args) => ({
    props: args,
    // Constrain width so the trigger + right-aligned caret are easy to see.
    template: `<div style="width: 16rem">
      <sbb-select
        [options]="options"
        [placeholder]="placeholder"
        [searchable]="searchable"
      ></sbb-select>
    </div>`,
  }),
};

export default meta;
type Story = StoryObj<SbbSelect<string>>;

/**
 * Click the trigger to open the dropdown, select an option, and confirm the
 * trigger reflects the choice and the panel closes.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox');
    expect(trigger).toHaveTextContent('Select a status');

    await fireEvent.click(trigger);
    const option = await canvas.findByRole('option', { name: 'Disabled' });
    // The panel is a native popover with a `sbb-fade-in` opacity animation on
    // open; `toBeVisible` reads opacity synchronously, so wait for it to settle.
    await waitFor(() => expect(option).toBeVisible());

    await fireEvent.click(option);

    await waitFor(() => expect(trigger).toHaveTextContent('Disabled'));
    await waitFor(() =>
      expect(trigger).toHaveAttribute('aria-expanded', 'false'),
    );
    expect(
      canvas.queryByRole('option', { name: 'Disabled' }),
    ).not.toBeInTheDocument();
  },
};

/**
 * Type into the filter to narrow the list, then select a filtered option.
 */
export const Searchable: Story = {
  args: { searchable: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox');

    await fireEvent.click(trigger);
    const filterInput = await canvas.findByPlaceholderText('Search…');
    await waitFor(() => expect(filterInput).toBeVisible());

    await userEvent.type(filterInput, 'sched');
    await waitFor(() =>
      expect(
        canvas.queryByRole('option', { name: 'Active' }),
      ).not.toBeInTheDocument(),
    );
    const option = canvas.getByRole('option', { name: 'Scheduled' });

    await fireEvent.click(option);
    await waitFor(() => expect(trigger).toHaveTextContent('Scheduled'));
  },
};

/**
 * Grouped options render group labels; selecting an option from a group
 * still resolves to the plain label on the trigger.
 */
export const Grouped: Story = {
  args: { options: groupedOptions, placeholder: 'Pick a column' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox');

    await fireEvent.click(trigger);
    const option = await canvas.findByRole('option', {
      name: 'Correlation ID',
    });
    await waitFor(() => expect(option).toBeVisible());
    expect(canvas.getByText('Application')).toBeVisible();
    expect(canvas.getByText('System')).toBeVisible();

    await fireEvent.click(option);
    await waitFor(() => expect(trigger).toHaveTextContent('Correlation ID'));
  },
};

/**
 * Regression: a select rendered *inside* an `SbbPopover`. Because the select's
 * dropdown is itself a native popover nested in the same DOM subtree, choosing
 * an option must NOT light-dismiss the surrounding popover. Open the popover,
 * open the select, and click an option — the popover stays open.
 */
export const InsidePopover: Story = {
  decorators: [moduleMetadata({ imports: [SbbPopover] })],
  render: (args) => ({
    props: args,
    template: `
      <button type="button" #trigger (click)="pop.toggle(trigger)">Open popover</button>
      <sbb-popover #pop>
        <div style="width: 16rem; padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem">
          <span>Pick a status inside the popover:</span>
          <sbb-select
            [options]="options"
            [placeholder]="placeholder"
            [searchable]="searchable"
          ></sbb-select>
        </div>
      </sbb-popover>`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await fireEvent.click(canvas.getByRole('button', { name: 'Open popover' }));
    const label = await canvas.findByText('Pick a status inside the popover:');
    await waitFor(() => expect(label).toBeVisible());

    const trigger = canvas.getByRole('combobox');
    await fireEvent.click(trigger);
    const option = await canvas.findByRole('option', { name: 'Disabled' });
    await waitFor(() => expect(option).toBeVisible());

    await fireEvent.click(option);
    await waitFor(() => expect(trigger).toHaveTextContent('Disabled'));

    // Regression: choosing the nested select's option must not light-dismiss
    // the surrounding popover.
    await waitFor(() =>
      expect(
        canvas.getByText('Pick a status inside the popover:'),
      ).toBeVisible(),
    );
  },
};
