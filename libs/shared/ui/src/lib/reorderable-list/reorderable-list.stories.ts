import { signal } from '@angular/core';
import { moduleMetadata } from '@storybook/angular-vite';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';
import { SbbReorderableList, SbbReorderableListReorderEvent } from './reorderable-list.component';
import { SbbReorderableListItemDef } from './reorderable-list-item.directive';
import { SbbReorderableListHandle } from './reorderable-list-handle.directive';

/**
 * Stories for `SbbReorderableList` — a generic drag-to-reorder list. Row
 * content is entirely up to the consumer's projected
 * `<ng-template sbbReorderableListItem>`; this component only owns the
 * drag/drop mechanics.
 *
 * Story ids follow the title: `Shared UI/Reorderable List` ->
 * `shared-ui-reorderable-list--default`.
 */
const meta: Meta<SbbReorderableList<string>> = {
  title: 'Shared UI/Reorderable List',
  component: SbbReorderableList,
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
  },
  args: { orientation: 'vertical', disabled: false },
  decorators: [moduleMetadata({ imports: [SbbReorderableListItemDef, SbbReorderableListHandle] })],
  render: (args) => {
    const items = signal(['Sequence', 'Id', 'Content type', 'Subject']);
    return {
      props: {
        ...args,
        items,
        onReordered: ({ previousIndex, currentIndex }: SbbReorderableListReorderEvent) => {
          const next = [...items()];
          const [moved] = next.splice(previousIndex, 1);
          next.splice(currentIndex, 0, moved);
          items.set(next);
        },
      },
      template: `<sbb-reorderable-list [items]="items()" [orientation]="orientation" [disabled]="disabled" (reordered)="onReordered($event)">
        <ng-template sbbReorderableListItem let-item let-i="index">
          <div class="row">
            <span sbbReorderableListHandle class="drag-handle">::</span>
            <span class="column-name">{{ item }}</span>
            <span class="remove">x</span>
          </div>
        </ng-template>
      </sbb-reorderable-list>
      <style>
        /* This row div is the same shape as a real call site (e.g. the message
           viewer's column-picker row: handle, a growing field, a trailing
           action) — it must stretch to the list's full width on its own. */
        .row { display: flex; align-items: center; gap: 0.5rem; border: 1px dashed light-dark(#cbd5e1, #475569); padding: 0.25rem 0.5rem; }
        .drag-handle { cursor: grab; }
        .drag-handle:active { cursor: grabbing; }
        .column-name { flex: 1; min-width: 0; background: light-dark(#e0f2fe, #0c4a6e); }
        .remove { cursor: pointer; }
      </style>`,
    };
  },
};

export default meta;
type Story = StoryObj<SbbReorderableList<string>>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Sequence')).toBeVisible();
    expect(canvas.getByText('Subject')).toBeVisible();
    expect(canvas.getAllByText('::').length).toBe(4);
  },
};

export const Horizontal: Story = {
  args: { orientation: 'horizontal' },
};

export const Disabled: Story = {
  args: { disabled: true },
};

/**
 * Dragging depends on real layout/pointer geometry that jsdom can't provide,
 * so reordering itself is for manual exploration in the browser rather than
 * an automated `play` assertion — drag "Id" below "Subject" using the `::`
 * handle and confirm the list reorders and stays reordered after the drop.
 */
export const Reorderable: Story = {};
