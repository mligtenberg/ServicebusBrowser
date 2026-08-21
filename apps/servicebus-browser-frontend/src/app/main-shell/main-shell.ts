import {
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
  viewChild,
  ChangeDetectionStrategy,
  input,
} from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { MainUiComponent, selectActivePage } from '@service-bus-browser/main-ui';
import {
  ColorThemeService,
  MessagePreferencesService,
  openAddConnectionPopup,
  openMcpSettingsPopup,
  WorkspaceService,
} from '@service-bus-browser/services';
import { SbbMenuItem, SbbToastService } from '@service-bus-browser/shared-ui';
import { messagesActions, messagePagesActions } from '@service-bus-browser/messages-store';
import { MessageFilter } from '@service-bus-browser/filtering';
import { TopologyActions } from '@service-bus-browser/topology-store';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, take } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UUID, Workspace } from '@service-bus-browser/shared-contracts';
import { WorkspaceSwitcherComponent } from './workspace-switcher/workspace-switcher';
import { WorkspaceSwitchService } from '../workspace-switch.service';

type ConnectionsBroadcastMessage = { type: 'connection-added'; name: string };
type WorkspaceBroadcastMessage =
  | { type: 'workspace-added'; workspace: Workspace }
  | { type: 'workspace-updated'; id: UUID; name: string; primaryColor: string };

/**
 * Every command an MCP tool can ask this window to act on, sent over a
 * single `mcp:command` IPC channel (see `tools.ts`'s `McpCommand`/
 * `sendCommand` on the main-process side) — one bridge method and one
 * listener below instead of a new pair per tool.
 */
type McpCommand =
  | { type: 'navigate-to-topology-path'; path: string }
  | { type: 'open-message-page'; workspaceId: string; pageId: string }
  | { type: 'set-active-page-filter'; filter: MessageFilter };

interface ElectronWindow {
  electron?: {
    platform?: string;
    onFullScreenChanged?: (callback: (fullscreen: boolean) => void) => void;
    checkForUpdates?: () => Promise<void>;
    onMcpCommand?: (callback: (command: McpCommand) => void) => void;
    reportActivePage?: (page: { pageId: string; pageName: string } | null) => void;
    reportActivePageFilter?: (filter: MessageFilter | null) => void;
  };
}

@Component({
  imports: [MainUiComponent, WorkspaceSwitcherComponent],
  selector: 'app-main-shell',
  templateUrl: './main-shell.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './main-shell.scss',
})
export class MainShell {
  private electron = (window as unknown as ElectronWindow).electron;
  isMac = this.electron?.platform === 'darwin';

  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toasts = inject(SbbToastService);
  private readonly workspaceService = inject(WorkspaceService);
  private readonly workspaceSwitchService = inject(WorkspaceSwitchService);
  store = inject(Store);

  workspaceId = input.required<string>();

  fullscreen = signal<boolean>(false);
  windowControlSpacing = computed(() => this.isMac && !this.fullscreen());

  private readonly workspaceSwitcher = viewChild.required(
    'workspaceSwitcher',
    { read: WorkspaceSwitcherComponent },
  );

  themeService = inject(ColorThemeService);
  messagePreferences = inject(MessagePreferencesService);
  darkMode = this.themeService.darkMode;

  menuItems = computed<SbbMenuItem<unknown>[]>(() => {
    // styleClass must be a live function, not a frozen string: the menu panel
    // renders in a CDK overlay that captures the item objects when it opens, so
    // a baked-in string can't update the checkmark while the panel is open.
    // resolve() re-invokes these on every signal-driven refresh.
    const selectionMarks = (selected: () => boolean, label: string) => ({
      label,
      styleClass: () => (selected() ? 'menu-item-selected' : ''),
    });

    return [
      {
        triggerTemplate: this.workspaceSwitcher().triggerTemplate(),
        panelTemplate: this.workspaceSwitcher().panelTemplate(),
        styleClass: () =>
          this.windowControlSpacing() ? 'ws-menu-item with-window-controls' : 'ws-menu-item',
      },
      {
        label: 'Connections',
        items: [
          {
            label: 'Add Connection',
            icon: 'fa-solid fa-plus',
            onSelect: () => openAddConnectionPopup(this.router, this.location),
          },
        ],
      },
      {
        label: 'Messages',
        items: [
          {
            label: 'Send',
            icon: 'fa-solid fa-paper-plane',
            onSelect: () => this.router.navigateByUrl(this.workspaceService.workspaceUrl('/messages/send')),
          },
          {
            label: 'Import',
            icon: 'fa-solid fa-upload',
            onSelect: () => {
              this.importMessages();
            },
          },
        ],
      },
      {
        label: 'Settings',
        items: [
          {
            label: 'Application Theme',
            icon: 'fa-solid fa-desktop',
            items: [
              {
                ...selectionMarks(() => this.themeService.preference() === 'sync', 'Sync with OS'),
                icon: 'fa-solid fa-desktop',
                onSelect: () => this.themeService.setPreference('sync'),
              },
              {
                ...selectionMarks(() => this.themeService.preference() === 'light', 'Light theme'),
                icon: 'fa-solid fa-sun',
                onSelect: () => this.themeService.setPreference('light'),
              },
              {
                ...selectionMarks(() => this.themeService.preference() === 'dark', 'Dark theme'),
                icon: 'fa-solid fa-moon',
                onSelect: () => this.themeService.setPreference('dark'),
              },
            ],
          },
          {
            label: 'Default Body View',
            icon: 'fa-solid fa-eye',
            items: [
              {
                ...selectionMarks(() => this.messagePreferences.defaultBodyView() === 'raw', 'Raw'),
                icon: 'fa-solid fa-file',
                onSelect: () => this.messagePreferences.setDefaultBodyView('raw'),
              },
              {
                ...selectionMarks(() => this.messagePreferences.defaultBodyView() === 'pretty', 'Pretty'),
                icon: 'fa-solid fa-wand-magic-sparkles',
                onSelect: () => this.messagePreferences.setDefaultBodyView('pretty'),
              },
            ],
          },
          {
            label: 'Search for Updates',
            icon: 'fa-solid fa-arrows-rotate',
            onSelect: () => this.electron?.checkForUpdates?.(),
          },
          {
            label: 'MCP Server',
            icon: 'fa-solid fa-plug',
            onSelect: () => openMcpSettingsPopup(this.router, this.location),
          },
          {
            label: 'About',
            icon: 'fa-solid fa-circle-info',
            onSelect: () => this.router.navigateByUrl(`${this.workspaceId()}/about`),
          },
        ],
      },
    ];
  });

  constructor() {
    this.electron?.onFullScreenChanged?.((full) => {
      this.fullscreen.set(full);
    });

    // Single dispatch point for every MCP-triggered command (see
    // `McpCommand` above and `tools.ts`'s matching union on the main-process
    // side) — one IPC listener instead of one per tool.
    this.electron?.onMcpCommand?.((command) => {
      switch (command.type) {
        case 'navigate-to-topology-path':
          // MCP's navigate_to_topology_node tool (ADR-0010) only opens the
          // management page today — there's no in-tree "select and expand
          // to this path" state to hook into yet, so we surface the
          // requested path via a toast instead of pretending to focus a
          // specific node.
          this.router.navigateByUrl(
            this.workspaceService.workspaceUrl('/manage-service-bus'),
          );
          this.toasts.show({
            severity: 'info',
            summary: 'Opened topology',
            detail: command.path,
          });
          break;

        case 'open-message-page':
          // MCP's open_message_page tool: navigate this window straight to
          // a given Workspace's Message Page. A plain router navigation is
          // enough even when workspaceId differs from what this window is
          // currently showing — workspaceActivationGuard reruns on every
          // :workspaceId change and switches the window over (see
          // docs/multi-window-workspace-routing.md).
          this.router.navigateByUrl(
            this.workspaceService.workspaceUrl(
              `/messages/page/${command.pageId}`,
              command.workspaceId as UUID,
            ),
          );
          break;

        case 'set-active-page-filter':
          // MCP's set_active_page_filter tool: apply a filter to whichever
          // Message Page this window's route is currently showing. Read
          // selectActivePage fresh (rather than reusing the id last pushed
          // to main via reportActivePage) so this always targets the page
          // the window is actually displaying at the moment the tool call
          // arrives.
          this.store
            .select(selectActivePage)
            .pipe(take(1))
            .subscribe((page) => {
              if (!page) {
                return;
              }
              this.store.dispatch(
                messagePagesActions.setPageFilter({ pageId: page.id, filter: command.filter }),
              );
            });
          break;
      }
    });

    // Backs the MCP get_active_page tool: main has no way to observe a
    // window's live Angular Router state on its own, so push it whenever
    // the active Message Page changes — the same pattern
    // workspace-window:report-active already uses for the active workspace.
    this.store
      .select(selectActivePage)
      .pipe(
        distinctUntilChanged((a, b) => a?.id === b?.id),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((page) => {
        this.electron?.reportActivePage?.(
          page ? { pageId: page.id, pageName: page.name } : null,
        );
      });

    const channel = new BroadcastChannel('connections');
    channel.addEventListener('message', (event) => {
      const message = event.data as ConnectionsBroadcastMessage;
      if (message?.type !== 'connection-added') {
        return;
      }
      // Dispatching through the store triggers change detection under
      // zoneless CD; a plain field write from this callback would not.
      this.store.dispatch(TopologyActions.loadTopologyRootNodes());
      this.toasts.show({
        severity: 'success',
        summary: 'Connection added',
        detail: message.name,
      });
    });
    this.destroyRef.onDestroy(() => channel.close());

    const workspacesChannel = new BroadcastChannel('workspaces');
    workspacesChannel.addEventListener('message', (event) => {
      const message = event.data as WorkspaceBroadcastMessage;
      if (message?.type === 'workspace-added') {
        this.workspaceService.addWorkspace(message.workspace);
        this.workspaceSwitchService.switchTo(message.workspace);
        this.toasts.show({
          severity: 'success',
          summary: 'Workspace created',
          detail: message.workspace.name,
        });
      } else if (message?.type === 'workspace-updated') {
        this.workspaceService.applyWorkspaceUpdate(message.id, {
          name: message.name,
          primaryColor: message.primaryColor,
        });
        this.toasts.show({
          severity: 'success',
          summary: 'Workspace updated',
          detail: message.name,
        });
      }
    });
    this.destroyRef.onDestroy(() => workspacesChannel.close());
  }

  importMessages(): void {
    this.store.dispatch(messagesActions.startImportMessages());
  }

}
