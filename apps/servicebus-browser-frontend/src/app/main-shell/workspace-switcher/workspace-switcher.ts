import {
  Component,
  computed,
  inject,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { Location, NgStyle } from '@angular/common';
import { Router } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faChevronDown,
  faPencil,
  faPlus,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import {
  SbbButton,
  SbbDialog,
  SbbMenuPanelContext,
  SbbTooltip,
} from '@service-bus-browser/shared-ui';
import {
  WorkspaceService,
  openCreateWorkspacePopup,
  openEditWorkspacePopup,
} from '@service-bus-browser/services';
import { WorkspaceSwitchService } from '../../workspace-switch.service';
import { Workspace } from '@service-bus-browser/shared-contracts';
import { Store } from '@ngrx/store';
import { TasksSelectors } from '@service-bus-browser/tasks-store';
import { countPagesByWorkspace, deleteWorkspaceData } from '@service-bus-browser/messages-db';

function workspaceHue(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash % 360;
}

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

/**
 * A workspace's own accent hue, rendered as a dark shade in light mode and a
 * light shade in dark mode — same lightness/saturation stops as the
 * `--sbb-primary-700` / `--sbb-primary-400` ramp entries, so the avatar stays
 * readable against its white initials in both themes instead of showing the
 * raw (possibly too-light-on-light-theme or too-dark-on-dark-theme) color.
 */
function readableAvatarColor(hue: number): string {
  return `light-dark(hsl(${hue}, 96%, 32%), hsl(${hue}, 93%, 60%))`;
}

function workspaceAccentHue(ws: Workspace): number {
  const fromPrimary = ws.primaryColor ? hexToHue(ws.primaryColor) : null;
  return fromPrimary ?? workspaceHue(ws.id);
}

function workspaceInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

@Component({
  selector: 'app-workspace-switcher',
  standalone: true,
  imports: [NgStyle, FaIconComponent, SbbDialog, SbbButton, SbbTooltip],
  templateUrl: './workspace-switcher.html',
  styleUrl: './workspace-switcher.scss',
})
export class WorkspaceSwitcherComponent {
  /** Projected into the menubar item as its trigger/panel content — see menu.models.ts. */
  readonly triggerTemplate = viewChild.required<TemplateRef<void>>('trigger');
  readonly panelTemplate =
    viewChild.required<TemplateRef<SbbMenuPanelContext>>('panel');

  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  workspaceService = inject(WorkspaceService);
  switchService = inject(WorkspaceSwitchService);

  protected readonly chevronIcon = faChevronDown;
  protected readonly plusIcon = faPlus;
  protected readonly pencilIcon = faPencil;
  protected readonly trashIcon = faTrash;

  activeWorkspace = this.workspaceService.activeWorkspace;
  availableWorkspaces = this.workspaceService.availableWorkspaces;

  activeTasks = this.store.selectSignal(TasksSelectors.selectTasks);
  hasActiveTasks = computed(() => this.activeTasks().length > 0);

  activeColor = computed(() => {
    const ws = this.activeWorkspace();
    return ws ? this.avatarColor(ws) : '#888';
  });

  activeInitials = computed(() => {
    const ws = this.activeWorkspace();
    return ws ? workspaceInitials(ws.name) : '??';
  });

  otherWorkspaces = computed(() => {
    const active = this.activeWorkspace();
    return this.availableWorkspaces()
      .filter((w) => w.id !== active?.id)
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  showConfirmDialog = signal(false);
  pendingWorkspace = signal<Workspace | null>(null);

  showDeleteDialog = signal(false);
  deleteTarget = signal<Workspace | null>(null);
  deleteStats = signal<{ connectionCount: number; pageCount: number } | null>(null);
  deleting = signal(false);

  avatarColor(ws: Workspace): string {
    return readableAvatarColor(workspaceAccentHue(ws));
  }

  initials(ws: Workspace): string {
    return workspaceInitials(ws.name);
  }

  openCreatePopup(): void {
    openCreateWorkspacePopup(this.router, this.location);
  }

  selectWorkspace(ws: Workspace): void {
    if (this.hasActiveTasks()) {
      this.pendingWorkspace.set(ws);
      this.showConfirmDialog.set(true);
    } else {
      this.switchService.switchTo(ws);
    }
  }

  onConfirmDialogOpenChange(open: boolean): void {
    if (!open) {
      this.cancelSwitch();
    }
  }

  async confirmSwitch(): Promise<void> {
    const ws = this.pendingWorkspace();
    if (!ws) return;
    this.showConfirmDialog.set(false);
    this.pendingWorkspace.set(null);
    await this.switchService.switchTo(ws);
  }

  cancelSwitch(): void {
    this.showConfirmDialog.set(false);
    this.pendingWorkspace.set(null);
  }

  openEditPopup(ws: Workspace): void {
    openEditWorkspacePopup(this.router, this.location, ws);
  }

  async openDeleteDialog(ws: Workspace): Promise<void> {
    this.deleteTarget.set(ws);
    this.deleteStats.set(null);
    this.showDeleteDialog.set(true);
    const [connectionCount, pageCount] = await Promise.all([
      this.workspaceService.countConnectionsByWorkspace(ws.id),
      countPagesByWorkspace(ws.id),
    ]);
    this.deleteStats.set({ connectionCount, pageCount });
  }

  onDeleteDialogOpenChange(open: boolean): void {
    if (!open) {
      this.cancelDelete();
    }
  }

  async confirmDelete(): Promise<void> {
    const ws = this.deleteTarget();
    if (!ws || this.deleting()) return;
    this.deleting.set(true);
    try {
      await this.workspaceService.deleteWorkspace(ws.id);
      await deleteWorkspaceData(ws.id);
      this.showDeleteDialog.set(false);
      this.deleteTarget.set(null);
    } finally {
      this.deleting.set(false);
    }
  }

  cancelDelete(): void {
    this.showDeleteDialog.set(false);
    this.deleteTarget.set(null);
    this.deleteStats.set(null);
  }
}
