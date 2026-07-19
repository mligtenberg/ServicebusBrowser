import {
  Component,
  computed,
  inject,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { NgStyle } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import {
  SbbButton,
  SbbDialog,
  SbbMenuPanelContext,
} from '@service-bus-browser/shared-ui';
import { WorkspaceService } from '@service-bus-browser/services';
import { WorkspaceSwitchService } from '../../workspace-switch.service';
import { Workspace } from '@service-bus-browser/shared-contracts';
import { Store } from '@ngrx/store';
import { TasksSelectors } from '@service-bus-browser/tasks-store';

function workspaceAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  const hue = hash % 360;
  return `hsl(${hue}, 55%, 45%)`;
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
  imports: [NgStyle, FaIconComponent, SbbDialog, SbbButton],
  templateUrl: './workspace-switcher.html',
  styleUrl: './workspace-switcher.scss',
})
export class WorkspaceSwitcherComponent {
  /** Projected into the menubar item as its trigger/panel content — see menu.models.ts. */
  readonly triggerTemplate = viewChild.required<TemplateRef<void>>('trigger');
  readonly panelTemplate =
    viewChild.required<TemplateRef<SbbMenuPanelContext>>('panel');

  private readonly store = inject(Store);
  workspaceService = inject(WorkspaceService);
  switchService = inject(WorkspaceSwitchService);

  protected readonly chevronIcon = faChevronDown;

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

  avatarColor(ws: Workspace): string {
    return ws.primaryColor ?? workspaceAvatarColor(ws.id);
  }

  initials(ws: Workspace): string {
    return workspaceInitials(ws.name);
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
}
