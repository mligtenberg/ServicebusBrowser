import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { faTrash, faXmark, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { SbbInputGroup } from './input-group';
import { SbbInputGroupAddon } from './input-group-addon';
import { SbbCheckbox } from '../checkbox/checkbox.component';
import { SbbInput } from '../input/input';
import { SbbInputNumber } from '../input-number/input-number.component';
import { SbbSelect } from '../select/select';
import { SbbButton } from '../button/button';
import { SbbFloatLabel } from '../float-label/float-label';

/**
 * Stories exercising the input-group's segmented border across the element
 * types the message-filter forms compose into a single row (checkbox addon,
 * selects, value inputs, trailing remove button). The border must wrap the
 * whole group and divide every slot, regardless of the value control's type.
 *
 * Navigate directly, e.g.:
 *   iframe.html?id=shared-ui-input-group--string-filter&globals=theme:dark
 */
const meta: Meta = {
  title: 'Shared UI/Input Group',
  decorators: [
    moduleMetadata({
      imports: [
        SbbInputGroup,
        SbbInputGroupAddon,
        SbbCheckbox,
        SbbInput,
        SbbInputNumber,
        SbbSelect,
        SbbButton,
        SbbFloatLabel,
      ],
    }),
  ],
  render: (args) => ({
    props: { ...args, removeIcon: faTrash },
  }),
};

export default meta;
type Story = StoryObj;

const fieldOptions = [
  { label: 'delivery-count', value: 'delivery-count' },
  { label: 'label', value: 'label' },
];
const filterOptions = [
  { label: 'equals', value: 'equals' },
  { label: 'less', value: 'less' },
];

const wrap = (inner: string) => `
  <div style="padding: 1rem; display: flex; flex-direction: column; gap: 1rem;">
    <sbb-input-group>
      <sbb-input-group-addon>
        <sbb-checkbox ariaLabel="Select filter" />
      </sbb-input-group-addon>
      <sbb-select [options]="fieldOptions" placeholder="Select Property" />
      <sbb-select [options]="filterOptions" placeholder="Filter Type" />
      ${inner}
      <sbb-button [icon]="removeIcon" [iconOnly]="true" severity="danger" variant="text" aria-label="Remove" />
    </sbb-input-group>
  </div>`;

/** String filter: text value input, trailing remove button. */
export const StringFilter: Story = {
  render: (args) => ({
    props: { ...args, fieldOptions, filterOptions, removeIcon: faTrash },
    template: wrap(`<sbb-input placeholder="Value" />`),
  }),
  play: async ({ canvasElement }) => {
    // `getByPlaceholderText`/`getByRole` both match ambiguously here: the
    // `<sbb-input placeholder="Value">` host attribute reflects onto the
    // custom element too (matching `getByPlaceholderText`), and the native
    // `<input>` has no computed accessible name from `placeholder` alone (no
    // `textbox` role match). Only one real `<input>` exists, so query it directly.
    const valueInput = canvasElement.querySelector('input') as HTMLInputElement;

    await userEvent.type(valueInput, 'delivery-count');

    await expect(valueInput).toHaveValue('delivery-count');
  },
};

/** Number filter: numeric value input. */
export const NumberFilter: Story = {
  render: (args) => ({
    props: { ...args, fieldOptions, filterOptions, removeIcon: faTrash },
    template: wrap(`<sbb-input-number ariaLabel="Filter value" />`),
  }),
};

/** Boolean filter: the value slot is itself a checkbox (no inner input/trigger). */
export const BooleanFilter: Story = {
  render: (args) => ({
    props: { ...args, fieldOptions, filterOptions, removeIcon: faTrash },
    template: wrap(`<sbb-checkbox ariaLabel="Filter value" />`),
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Two checkboxes render: the row's leading select-all addon, then the
    // value-slot checkbox this story is about — pick the latter.
    const [, valueCheckbox] = canvas.getAllByRole('checkbox');

    await userEvent.click(valueCheckbox);

    await waitFor(() => expect(valueCheckbox).toHaveAttribute('aria-checked', 'true'));
  },
};

/**
 * Input-first with trailing action addons (endpoint-selector pattern):
 * a readonly input followed by two icon buttons in addons.
 */
export const InputWithActions: Story = {
  render: () => ({
    props: { clearIcon: faXmark, searchIcon: faMagnifyingGlass },
    template: `
      <div style="padding: 1rem;">
        <sbb-input-group>
          <sbb-input placeholder="Select endpoint…" [readonly]="true" />
          <sbb-input-group-addon>
            <sbb-button [icon]="clearIcon" [iconOnly]="true" severity="danger" variant="text" aria-label="clear" />
          </sbb-input-group-addon>
          <sbb-input-group-addon>
            <sbb-button [icon]="searchIcon" [iconOnly]="true" variant="text" aria-label="search" />
          </sbb-input-group-addon>
        </sbb-input-group>
      </div>`,
  }),
};

/** A row of float-labelled number inputs (duration-input pattern). */
export const FloatLabelRow: Story = {
  render: () => ({
    props: {},
    template: `
      <div style="padding: 1rem;">
        <sbb-input-group>
          <sbb-float-label variant="on" label="Days">
            <sbb-input-number />
          </sbb-float-label>
          <sbb-float-label variant="on" label="Hours">
            <sbb-input-number />
          </sbb-float-label>
          <sbb-float-label variant="on" label="Minutes">
            <sbb-input-number />
          </sbb-float-label>
        </sbb-input-group>
      </div>`,
  }),
};

/** No remove button: the value input is the last child. */
export const WithoutRemove: Story = {
  render: (args) => ({
    props: { ...args, fieldOptions, filterOptions },
    template: `
      <div style="padding: 1rem;">
        <sbb-input-group>
          <sbb-input-group-addon>
            <sbb-checkbox ariaLabel="Select filter" />
          </sbb-input-group-addon>
          <sbb-select [options]="fieldOptions" placeholder="Select Property" />
          <sbb-select [options]="filterOptions" placeholder="Filter Type" />
          <sbb-input placeholder="Value" />
        </sbb-input-group>
      </div>`,
  }),
};
