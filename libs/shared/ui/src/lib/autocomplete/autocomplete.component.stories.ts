import { moduleMetadata } from '@storybook/angular-vite';
import type { Meta, StoryObj } from '@storybook/angular-vite';
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
