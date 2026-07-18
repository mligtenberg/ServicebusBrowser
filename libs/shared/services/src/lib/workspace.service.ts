import { effect, inject, Injectable, signal } from '@angular/core';
import { UUID, Workspace } from '@service-bus-browser/shared-contracts';
import { WorkspacesFrontendClient } from '@service-bus-browser/service-bus-frontend-clients';

/**
 * Lightness/saturation stops lifted from the default `--sbb-primary-*` ramp
 * in `_tokens.scss` (all stops share ~hue 200 there) — only the hue changes
 * per workspace, so the ramp keeps the same contrast steps every semantic
 * token (`--sbb-surface`, `--sbb-primary-text`, `--sbb-primary-surface`, …)
 * was tuned against.
 */
const PRIMARY_RAMP_STOPS: { shade: number; s: number; l: number }[] = [
  { shade: 50, s: 100, l: 97 },
  { shade: 100, s: 94, l: 94 },
  { shade: 200, s: 94, l: 86 },
  { shade: 300, s: 95, l: 74 },
  { shade: 400, s: 93, l: 60 },
  { shade: 500, s: 89, l: 48 },
  { shade: 600, s: 98, l: 39 },
  { shade: 700, s: 96, l: 32 },
  { shade: 800, s: 90, l: 27 },
  { shade: 900, s: 80, l: 24 },
  { shade: 950, s: 80, l: 16 },
];

function hexToHue(hex: string): number | null {
  const match = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return null;
  const r = parseInt(match[1].slice(0, 2), 16) / 255;
  const g = parseInt(match[1].slice(2, 4), 16) / 255;
  const b = parseInt(match[1].slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return 0;
  const d = max - min;
  let h: number;
  switch (max) {
    case r:
      h = (g - b) / d + (g < b ? 6 : 0);
      break;
    case g:
      h = (b - r) / d + 2;
      break;
    default:
      h = (r - g) / d + 4;
  }
  return Math.round(h * 60);
}

@Injectable({
  providedIn: 'root',
})
export class WorkspaceService {
  private static readonly ACTIVE_WORKSPACE_ID_KEY = 'sbb-active-workspace-id';

  private readonly _activeWorkspace = signal<Workspace | undefined>(undefined);
  readonly activeWorkspace = this._activeWorkspace.asReadonly();

  private readonly _availableWorkspaces = signal<Workspace[]>([]);
  readonly availableWorkspaces = this._availableWorkspaces.asReadonly();

  private readonly workspacesClient = inject(WorkspacesFrontendClient);

  constructor() {
    effect(() => {
      const hue = hexToHue(this._activeWorkspace()?.primaryColor ?? '');
      const root = document.documentElement.style;
      if (hue !== null) {
        for (const { shade, s, l } of PRIMARY_RAMP_STOPS) {
          root.setProperty(`--sbb-primary-${shade}`, `hsl(${hue}, ${s}%, ${l}%)`);
        }
      } else {
        for (const { shade } of PRIMARY_RAMP_STOPS) {
          root.removeProperty(`--sbb-primary-${shade}`);
        }
      }
    });
  }

  /**
   * Picks the active workspace from the available list. Reads the last-active
   * id from localStorage; if it's missing or no longer present in the list
   * (e.g. that workspace was deleted on another machine, or this is first
   * boot), falls back to the first workspace and writes it back.
   */
  initialize(workspaces: Workspace[]): Workspace {
    if (workspaces.length === 0) {
      throw new Error('Cannot initialize WorkspaceService with empty workspace list');
    }

    this._availableWorkspaces.set(workspaces);

    const storedId = localStorage.getItem(
      WorkspaceService.ACTIVE_WORKSPACE_ID_KEY,
    ) as UUID | null;

    const active =
      (storedId && workspaces.find((w) => w.id === storedId)) ?? workspaces[0];

    if (storedId !== active.id) {
      localStorage.setItem(
        WorkspaceService.ACTIVE_WORKSPACE_ID_KEY,
        active.id,
      );
    }

    this._activeWorkspace.set(active);
    return active;
  }

  /** Update active workspace signals + persist. Called by the coordinator. */
  async setActive(workspace: Workspace): Promise<void> {
    this._activeWorkspace.set(workspace);
    localStorage.setItem(WorkspaceService.ACTIVE_WORKSPACE_ID_KEY, workspace.id);
    await this.workspacesClient.setActiveWorkspaceId(workspace.id);
  }

  /** Add a newly created workspace to the available list. */
  addWorkspace(workspace: Workspace): void {
    this._availableWorkspaces.update((ws) => [...ws, workspace]);
  }

  async createWorkspace(name: string, primaryColor?: string): Promise<Workspace> {
    const workspace = await this.workspacesClient.createWorkspace(name, primaryColor);
    this.addWorkspace(workspace);
    return workspace;
  }

  async updateWorkspace(
    id: UUID,
    updates: { name?: string; primaryColor?: string },
  ): Promise<void> {
    await this.workspacesClient.updateWorkspace(id, updates);
    this._availableWorkspaces.update((ws) =>
      ws.map((w) => (w.id === id ? { ...w, ...updates } : w)),
    );
    if (this._activeWorkspace()?.id === id) {
      this._activeWorkspace.update((w) => (w ? { ...w, ...updates } : w));
    }
  }

  async deleteWorkspace(id: UUID): Promise<void> {
    await this.workspacesClient.deleteWorkspace(id);
    this._availableWorkspaces.update((ws) => ws.filter((w) => w.id !== id));
  }

  async countConnectionsByWorkspace(id: UUID): Promise<number> {
    return this.workspacesClient.countConnectionsByWorkspace(id);
  }
}
