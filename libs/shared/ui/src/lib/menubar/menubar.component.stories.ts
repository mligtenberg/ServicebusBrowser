import { Component, computed, signal, TemplateRef, viewChild } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect, fireEvent, waitFor, within } from 'storybook/test';
import type { SbbMenuItem, SbbMenuPanelContext } from '../menu';
import { SbbMenubar } from './menubar.component';

/**
 * Stories for `SbbMenubar` — the top application menu bar.
 *
 * `WorkspaceSwitcherLike` reproduces the real workspace-switcher pattern: a
 * menubar item whose trigger and panel are custom templates (an avatar
 * button + a list of actionable rows), not the default label/icon + flat
 * items list. That panel is declared *outside* SbbMenubar's own component
 * tree, so its content can't use `cdkMenuItem` to close itself — the
 * embedded view's injector is rooted where the `<ng-template>` was
 * *declared* (this host component), not where CDK physically inserts it
 * into the overlay, so `CdkMenuItem`'s constructor can't find the ambient
 * `cdk-menu-stack` token there (NG0201, a real regression this shipped
 * with). The panel must call the `close` template-context callback
 * instead — see `SbbMenuPanelContext` in `menu.models.ts`.
 *
 * iframe.html?id=shared-ui-menubar--workspace-switcher-like&globals=theme:dark
 */
@Component({
  standalone: true,
  imports: [SbbMenubar],
  template: `
    <sbb-menubar [model]="model()" />
    <p>Selected: {{ selected() ?? 'none' }}</p>

    <ng-template #trigger>
      <span>My Workspace</span>
    </ng-template>
    <ng-template #panel let-close>
      <button type="button" (click)="close(); selected.set('Workspace A')">
        Workspace A
      </button>
      <button type="button" (click)="close(); selected.set('Workspace B')">
        Workspace B
      </button>
    </ng-template>
  `,
})
class WorkspaceSwitcherLikeHost {
  private readonly triggerTpl = viewChild.required<TemplateRef<void>>('trigger');
  private readonly panelTpl =
    viewChild.required<TemplateRef<SbbMenuPanelContext>>('panel');

  readonly selected = signal<string | null>(null);

  readonly model = computed<SbbMenuItem<void>[]>(() => [
    { triggerTemplate: this.triggerTpl(), panelTemplate: this.panelTpl() },
    { label: 'Connections', items: [{ label: 'Add Connection' }] },
  ]);
}

const meta: Meta<WorkspaceSwitcherLikeHost> = {
  title: 'Shared UI/Menubar',
  component: WorkspaceSwitcherLikeHost,
};

export default meta;
type Story = StoryObj<WorkspaceSwitcherLikeHost>;

export const WorkspaceSwitcherLike: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The open panel renders in a CDK overlay appended to document.body,
    // outside canvasElement — same reason menubar.component.spec.ts queries
    // the global `document` for opened submenu/panel content.
    const body = within(document.body);

    const trigger = await canvas.findByText('My Workspace');
    await fireEvent.click(trigger);

    const optionA = await body.findByText('Workspace A');
    await waitFor(() => expect(optionA).toBeVisible());

    // Closing via the `close` context callback must not throw NG0201 and
    // must actually collapse the panel — the regression this story guards.
    await fireEvent.click(optionA);
    await waitFor(() =>
      expect(body.queryByText('Workspace A')).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(canvas.getByText('Selected: Workspace A')).toBeVisible(),
    );
  },
};
