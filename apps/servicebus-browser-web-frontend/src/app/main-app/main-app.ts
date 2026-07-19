import { Component, computed, inject, OnInit, signal, viewChild } from '@angular/core';

import { MainUiComponent, pagesActions } from '@service-bus-browser/main-ui';
import { SbbMenu, SbbMenuItem, SbbButton } from '@service-bus-browser/shared-ui';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ColorThemeService, MessagePreferencesService, WorkspaceService } from '@service-bus-browser/services';
import { messagesActions } from '@service-bus-browser/messages-store';
import { WorkspaceSwitcherComponent } from './workspace-switcher/workspace-switcher';
import { WorkspacesFrontendClient } from '@service-bus-browser/service-bus-frontend-clients';
import { initializeWorkspace, migrateOpfsFiles, getMessagesRepository } from '@service-bus-browser/messages-db';

@Component({
  selector: 'app-main-app',
  imports: [SbbButton, MainUiComponent, SbbMenu, WorkspaceSwitcherComponent],
  templateUrl: './main-app.html',
  styleUrl: './main-app.scss',
})
export class MainApp implements OnInit {
  private oidcSecurityService = inject(OidcSecurityService);
  private themeService = inject(ColorThemeService);
  private messagePreferences = inject(MessagePreferencesService);
  private workspaceService = inject(WorkspaceService);
  private workspacesClient = inject(WorkspacesFrontendClient);

  protected title = 'Service Bus Browser';
  private readonly store = inject(Store);

  workspacesInitialized = signal(false);

  // Optional: only rendered once `workspacesInitialized()` flips the `@defer` block on.
  private readonly workspaceSwitcher = viewChild('workspaceSwitcher', {
    read: WorkspaceSwitcherComponent,
  });

  userData = toSignal(
    this.oidcSecurityService.userData$.pipe(map((r) => r.userData)),
  );
  userName = computed(() => this.userData()?.name);
  faUser = faUser;

  menuItems = computed<SbbMenuItem[]>(() => {
    const themePref = this.themeService.preference();
    const bodyView = this.messagePreferences.defaultBodyView();
    const selectionMarks = (selected: boolean, label: string) =>
      selected
        ? {
            label,
            styleClass: 'menu-item-selected',
          }
        : { label };

    const switcher = this.workspaceSwitcher();

    return [
      ...(switcher
        ? [
            {
              triggerTemplate: switcher.triggerTemplate(),
              panelTemplate: switcher.panelTemplate(),
            },
          ]
        : []),
      {
        label: 'Messages',
        items: [
          {
            label: 'Send',
            icon: 'pi pi-send',
            routerLink: '/messages/send',
          },
          {
            label: 'Import',
            icon: 'pi pi-upload',
            command: () => {
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
            icon: 'pi pi-desktop',
            items: [
              {
                ...selectionMarks(themePref === 'sync', 'Sync with OS'),
                icon: 'pi pi-desktop',
                command: () => this.themeService.setPreference('sync'),
              },
              {
                ...selectionMarks(themePref === 'light', 'Light theme'),
                icon: 'pi pi-sun',
                command: () => this.themeService.setPreference('light'),
              },
              {
                ...selectionMarks(themePref === 'dark', 'Dark theme'),
                icon: 'pi pi-moon',
                command: () => this.themeService.setPreference('dark'),
              },
            ],
          },
          {
            label: 'Default Body View',
            icon: 'pi pi-eye',
            items: [
              {
                ...selectionMarks(bodyView === 'raw', 'Raw'),
                icon: 'pi pi-file',
                command: () => this.messagePreferences.setDefaultBodyView('raw'),
              },
              {
                ...selectionMarks(bodyView === 'pretty', 'Pretty'),
                icon: 'pi pi-sparkles',
                command: () => this.messagePreferences.setDefaultBodyView('pretty'),
              },
            ],
          },
          {
            label: 'About',
            icon: 'pi pi-info-circle',
            routerLink: '/about',
          },
        ],
      },
    ];
  });

  accountMenuItems: SbbMenuItem[] = [
    {
      label: 'Sign-out',
      icon: 'pi pi-sign-out',
      command: () => {
        this.signOut();
      },
    },
  ];

  async ngOnInit(): Promise<void> {
    // Auth is confirmed by AutoLoginPartialRoutesGuard before this component
    // renders, so the token is available for these HTTP calls.
    const workspaces = await this.workspacesClient.listWorkspaces();
    const workspace = this.workspaceService.initialize(workspaces);
    this.store.dispatch(pagesActions.workspaceActivated({ workspaceId: workspace.id }));
    await this.workspacesClient.setActiveWorkspaceId(workspace.id);

    try {
      await migrateOpfsFiles(workspace.id);
    } catch (err) {
      console.warn('OPFS migration failed; will retry on next boot:', err);
    }
    initializeWorkspace(workspace.id);
    await getMessagesRepository();

    this.workspacesInitialized.set(true);
  }

  importMessages(): void {
    this.store.dispatch(messagesActions.startImportMessages());
  }

  signOut(): void {
    this.oidcSecurityService.logoff().subscribe();
  }
}
