import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
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

export const Default: Story = {};

export const Searchable: Story = { args: { searchable: true } };

export const Grouped: Story = {
  args: { options: groupedOptions, placeholder: 'Pick a column' },
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
};
