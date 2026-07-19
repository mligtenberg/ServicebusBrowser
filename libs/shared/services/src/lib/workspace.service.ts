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

  /** Fetches the workspace list. */
  async loadWorkspaces(): Promise<Workspace[]> {
    const workspaces = await this.workspacesClient.listWorkspaces();
    this._availableWorkspaces.set(workspaces);
    return workspaces;
  }

  private loadPromise: Promise<Workspace[]> | undefined;

  /**
   * Loads the workspace list on first call and caches the in-flight promise,
   * so every route guard invocation (root redirect, `:workspaceId`
   * activation) can await it without triggering duplicate fetches or racing
   * each other. Called from the guards rather than an app initializer so it
   * runs after any route-level auth guard (e.g. the web app's
   * `AutoLoginPartialRoutesGuard`) has already resolved — app initializers
   * run concurrently with each other and can't offer that ordering.
   */
  ensureWorkspacesLoaded(): Promise<Workspace[]> {
    if (this._availableWorkspaces().length > 0) {
      return Promise.resolve(this._availableWorkspaces());
    }
    this.loadPromise ??= this.loadWorkspaces();
    return this.loadPromise;
  }

  /**
   * Resolves which workspace a window should land on when its URL doesn't
   * name one (or names one that no longer exists): the last-active id from
   * localStorage if it still resolves, else the first available workspace.
   * Normalizes localStorage back to that result so the next such fallback
   * doesn't repeat the same resolution.
   */
  resolveFallback(): Workspace {
    const workspaces = this._availableWorkspaces();
    if (workspaces.length === 0) {
      throw new Error('Cannot resolve a fallback workspace with an empty workspace list');
    }

    const storedId = localStorage.getItem(
      WorkspaceService.ACTIVE_WORKSPACE_ID_KEY,
    ) as UUID | null;

    const fallback =
      (storedId && workspaces.find((w) => w.id === storedId)) ?? workspaces[0];

    if (storedId !== fallback.id) {
      localStorage.setItem(WorkspaceService.ACTIVE_WORKSPACE_ID_KEY, fallback.id);
    }

    return fallback;
  }

  /**
   * Marks `workspace` active in memory only — no localStorage write. Used by
   * the route guard for every URL-driven activation (boot included), since
   * that pointer is only meant to move on an explicit switch/open action.
   */
  activateInMemory(workspace: Workspace): void {
    this._activeWorkspace.set(workspace);
  }

  /** Records `id` as the last-active workspace without changing this window's own active signal — used when explicitly opening a workspace in a *different* window. */
  rememberLastActiveId(id: UUID): void {
    localStorage.setItem(WorkspaceService.ACTIVE_WORKSPACE_ID_KEY, id);
  }

  /** Update active workspace signals + persist. Called by the coordinator on an explicit switch. */
  async setActive(workspace: Workspace): Promise<void> {
    this._activeWorkspace.set(workspace);
    localStorage.setItem(WorkspaceService.ACTIVE_WORKSPACE_ID_KEY, workspace.id);
    await this.workspacesClient.setActiveWorkspaceId(workspace.id);
  }

  /** Builds an absolute, workspace-prefixed URL, e.g. `workspaceUrl('/messages/send')` → `/<id>/messages/send`, `workspaceUrl('/')` → `/<id>`. Defaults to the active workspace. */
  workspaceUrl(path: string, workspaceId?: UUID): string {
    const id = workspaceId ?? this._activeWorkspace()?.id;
    if (!id) {
      throw new Error('Cannot build a workspace URL with no active or given workspace id');
    }
    if (path === '/' || path === '') {
      return `/${id}`;
    }
    return `/${id}${path.startsWith('/') ? path : `/${path}`}`;
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
    this.applyWorkspaceUpdate(id, updates);
  }

  /**
   * Apply an already-persisted update to the signals only, without hitting
   * the API again. Used by the main window when notified (via
   * BroadcastChannel) that a *different* process — e.g. the edit-workspace
   * popup, a separate Electron renderer with its own `WorkspaceService` —
   * already persisted the change.
   */
  applyWorkspaceUpdate(
    id: UUID,
    updates: { name?: string; primaryColor?: string },
  ): void {
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
