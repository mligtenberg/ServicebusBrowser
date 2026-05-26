import {
  Component,
  computed,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Popover } from 'primeng/popover';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
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
  imports: [NgStyle, FormsModule, Popover, Dialog, Button, InputText],
  templateUrl: './workspace-switcher.html',
  styleUrl: './workspace-switcher.scss',
})
export class WorkspaceSwitcherComponent {
  @ViewChild('op') popover!: Popover;

  private readonly store = inject(Store);
  workspaceService = inject(WorkspaceService);
  switchService = inject(WorkspaceSwitchService);

  activeWorkspace = this.workspaceService.activeWorkspace;
  availableWorkspaces = this.workspaceService.availableWorkspaces;

  activeTasks = this.store.selectSignal(TasksSelectors.selectTasks);
  hasActiveTasks = computed(() => this.activeTasks().length > 0);

  activeColor = computed(() => {
    const ws = this.activeWorkspace();
    return ws ? workspaceAvatarColor(ws.id) : '#888';
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
  creating = signal(false);

  showConfirmDialog = signal(false);
  pendingWorkspace = signal<Workspace | null>(null);

  avatarColor(ws: Workspace): string {
    return workspaceAvatarColor(ws.id);
  }

  initials(ws: Workspace): string {
    return workspaceInitials(ws.name);
  }

  togglePopover(event: Event): void {
    this.popover.toggle(event);
  }

  openCreateDialog(): void {
    this.popover.hide();
    this.newWorkspaceName.set('');
    this.showCreateDialog.set(true);
  }

  async submitCreate(): Promise<void> {
    const name = this.newWorkspaceName().trim();
    if (!name || this.creating()) return;
    this.creating.set(true);
    try {
      await this.switchService.createAndSwitch(name);
      this.showCreateDialog.set(false);
    } finally {
      this.creating.set(false);
    }
  }

  cancelCreate(): void {
    this.showCreateDialog.set(false);
  }

  selectWorkspace(ws: Workspace): void {
    this.popover.hide();
    if (this.hasActiveTasks()) {
      this.pendingWorkspace.set(ws);
      this.showConfirmDialog.set(true);
    } else {
      this.switchService.switchTo(ws);
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
