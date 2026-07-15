import type { Meta, StoryObj } from '@storybook/angular-vite';
import { SbbButton } from './button';

/**
 * Smoke story proving the Storybook host renders an `sbb` component with the
 * design tokens and zoneless change detection wired up. Story ids follow the
 * title: `Shared UI/Button` -> `shared-ui-button--primary`, so an agent can
 * navigate straight to e.g.
 *   iframe.html?id=shared-ui-button--primary&globals=theme:dark
 */
const meta: Meta<SbbButton> = {
  title: 'Shared UI/Button',
  component: SbbButton,
  tags: ['autodocs'],
  argTypes: {
    severity: {
      control: 'select',
      options: ['primary', 'secondary', 'danger'],
    },
    variant: {
      control: 'select',
      options: ['filled', 'outlined', 'text'],
    },
    size: { control: 'select', options: ['small', 'medium', 'large'] },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    rounded: { control: 'boolean' },
  },
  // Full default args: the template binds every input, so unset args would
  // bind an explicit `undefined` and clobber the component's own `input()`
  // defaults (a signal input falls back to its default only when NOT bound).
  args: {
    severity: 'primary',
    variant: 'filled',
    size: 'medium',
    disabled: false,
    loading: false,
    rounded: false,
  },
  render: (args) => ({
    props: args,
    template: `<sbb-button
      [severity]="severity"
      [variant]="variant"
      [size]="size"
      [disabled]="disabled"
      [loading]="loading"
      [rounded]="rounded"
    >Button</sbb-button>`,
  }),
};

export default meta;
type Story = StoryObj<SbbButton>;

export const Primary: Story = { args: { severity: 'primary' } };

export const Secondary: Story = {
  args: { severity: 'secondary', variant: 'outlined' },
};

export const Danger: Story = { args: { severity: 'danger' } };

export const Disabled: Story = { args: { disabled: true } };

export const Loading: Story = { args: { loading: true } };
