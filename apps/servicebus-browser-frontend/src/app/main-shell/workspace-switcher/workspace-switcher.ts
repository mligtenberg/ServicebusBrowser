import {
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  SbbInput,
  SbbPopover,
  SbbTooltip,
} from '@service-bus-browser/shared-ui';
import { WorkspaceService } from '@service-bus-browser/services';
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

function workspaceAvatarColorHex(id: string): string {
  return hslToHex(workspaceHue(id), 55, 45);
}

/** hsl(h, s%, l%) -> #rrggbb, so it can seed a native <input type="color"> value. */
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
  imports: [
    NgStyle,
    FormsModule,
    FaIconComponent,
    SbbPopover,
    SbbDialog,
    SbbButton,
    SbbInput,
    SbbTooltip,
  ],
  templateUrl: './workspace-switcher.html',
  styleUrl: './workspace-switcher.scss',
})
export class WorkspaceSwitcherComponent {
  private readonly popover = viewChild.required<SbbPopover>('op');

  private readonly store = inject(Store);
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

  showCreateDialog = signal(false);
  newWorkspaceName = signal('');
  newWorkspaceColor = signal('#3b82f6');
  creating = signal(false);

  showConfirmDialog = signal(false);
  pendingWorkspace = signal<Workspace | null>(null);

  showRenameDialog = signal(false);
  renameTarget = signal<Workspace | null>(null);
  renameWorkspaceName = signal('');
  renameWorkspaceColor = signal('#3b82f6');
  renaming = signal(false);

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

  togglePopover(event: Event): void {
    this.popover().toggle(event.currentTarget as HTMLElement);
  }

  openCreateDialog(): void {
    this.popover().close();
    this.newWorkspaceName.set('');
    this.newWorkspaceColor.set(randomWorkspaceColor());
    this.showCreateDialog.set(true);
  }

  async submitCreate(): Promise<void> {
    const name = this.newWorkspaceName().trim();
    if (!name || this.creating()) return;
    this.creating.set(true);
    try {
      await this.switchService.createAndSwitch(name, this.newWorkspaceColor());
      this.showCreateDialog.set(false);
    } finally {
      this.creating.set(false);
    }
  }

  cancelCreate(): void {
    this.showCreateDialog.set(false);
  }

  selectWorkspace(ws: Workspace): void {
    this.popover().close();
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

  openRenameDialog(ws: Workspace): void {
    this.popover().close();
    this.renameTarget.set(ws);
    this.renameWorkspaceName.set(ws.name);
    this.renameWorkspaceColor.set(ws.primaryColor ?? workspaceAvatarColorHex(ws.id));
    this.showRenameDialog.set(true);
  }

  onRenameDialogOpenChange(open: boolean): void {
    if (!open) {
      this.cancelRename();
    }
  }

  async submitRename(): Promise<void> {
    const ws = this.renameTarget();
    const name = this.renameWorkspaceName().trim();
    if (!ws || !name || this.renaming()) return;
    this.renaming.set(true);
    try {
      await this.workspaceService.updateWorkspace(ws.id, {
        name,
        primaryColor: this.renameWorkspaceColor(),
      });
      this.showRenameDialog.set(false);
    } finally {
      this.renaming.set(false);
    }
  }

  cancelRename(): void {
    this.showRenameDialog.set(false);
    this.renameTarget.set(null);
  }

  async openDeleteDialog(ws: Workspace): Promise<void> {
    this.popover().close();
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
