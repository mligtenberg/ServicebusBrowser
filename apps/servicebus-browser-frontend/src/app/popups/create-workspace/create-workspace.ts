import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SbbButton, SbbInput } from '@service-bus-browser/shared-ui';
import { Workspace } from '@service-bus-browser/shared-contracts';
import { WorkspaceService } from '@service-bus-browser/services';

type WorkspaceBroadcastMessage = { type: 'workspace-added'; workspace: Workspace };

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

@Component({
  selector: 'app-create-workspace',
  imports: [FormsModule, SbbButton, SbbInput],
  templateUrl: './create-workspace.html',
  styleUrl: './create-workspace.scss',
})
export class CreateWorkspaceComponent {
  private readonly workspaceService = inject(WorkspaceService);

  name = signal('');
  color = signal(randomWorkspaceColor());
  creating = signal(false);

  async submit(): Promise<void> {
    const name = this.name().trim();
    if (!name || this.creating()) return;
    this.creating.set(true);
    try {
      const workspace = await this.workspaceService.createWorkspace(name, this.color());
      this.broadcastAndClose(workspace);
    } finally {
      this.creating.set(false);
    }
  }

  cancel(): void {
    window.close();
  }

  private broadcastAndClose(workspace: Workspace): void {
    const message: WorkspaceBroadcastMessage = { type: 'workspace-added', workspace };
    const channel = new BroadcastChannel('workspaces');
    channel.postMessage(message);
    channel.close();
    window.close();
  }
}
