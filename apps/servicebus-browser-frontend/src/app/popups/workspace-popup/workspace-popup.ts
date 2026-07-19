import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SbbButton, SbbInput } from '@service-bus-browser/shared-ui';
import { UUID, Workspace } from '@service-bus-browser/shared-contracts';
import { WorkspaceService } from '@service-bus-browser/services';

type WorkspaceBroadcastMessage =
  | { type: 'workspace-added'; workspace: Workspace }
  | { type: 'workspace-updated'; id: UUID; name: string; primaryColor: string };

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (n: number) =>
    Math.round(f(n) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(0)}${toHex(8)}${toHex(4)}`;
}

function randomWorkspaceColor(): string {
  return hslToHex(Math.floor(Math.random() * 360), 55, 45);
}

/**
 * Add and edit workspace share this one popup: it's a separate Electron
 * window/renderer with its own `WorkspaceService` instance, so either mode
 * has to persist via the API itself and notify the opener over the
 * `workspaces` `BroadcastChannel` rather than relying on shared state. The
 * `id` route param is the only thing that differs between the two modes —
 * present means edit (prefilled from query params the opener passed in,
 * since this popup has no app state of its own to look the workspace up
 * from) and absent means create.
 */
@Component({
  selector: 'app-workspace-popup',
  imports: [FormsModule, SbbButton, SbbInput],
  templateUrl: './workspace-popup.html',
  styleUrl: './workspace-popup.scss',
})
export class WorkspacePopupComponent {
  private readonly workspaceService = inject(WorkspaceService);
  private readonly route = inject(ActivatedRoute);

  private readonly editId = this.route.snapshot.paramMap.get('id') as UUID | null;
  readonly isEditMode = this.editId !== null;

  name = signal(this.route.snapshot.queryParamMap.get('name') ?? '');
  color = signal(
    this.route.snapshot.queryParamMap.get('color') ?? randomWorkspaceColor(),
  );
  saving = signal(false);

  async submit(): Promise<void> {
    const name = this.name().trim();
    if (!name || this.saving()) return;
    this.saving.set(true);
    try {
      if (this.editId) {
        const primaryColor = this.color();
        await this.workspaceService.updateWorkspace(this.editId, {
          name,
          primaryColor,
        });
        this.broadcastAndClose({
          type: 'workspace-updated',
          id: this.editId,
          name,
          primaryColor,
        });
      } else {
        const workspace = await this.workspaceService.createWorkspace(
          name,
          this.color(),
        );
        this.broadcastAndClose({ type: 'workspace-added', workspace });
      }
    } finally {
      this.saving.set(false);
    }
  }

  cancel(): void {
    window.close();
  }

  private broadcastAndClose(message: WorkspaceBroadcastMessage): void {
    const channel = new BroadcastChannel('workspaces');
    channel.postMessage(message);
    channel.close();
    window.close();
  }
}
