import { Component, computed, inject, viewChild, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

import { MainUiComponent } from '@service-bus-browser/main-ui';
import { SbbMenu, SbbMenuItem, SbbButton } from '@service-bus-browser/shared-ui';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ColorThemeService, MessagePreferencesService, WorkspaceService } from '@service-bus-browser/services';
import { messagesActions } from '@service-bus-browser/messages-store';
import { WorkspaceSwitcherComponent } from './workspace-switcher/workspace-switcher';

@Component({
  selector: 'app-main-app',
  imports: [SbbButton, MainUiComponent, SbbMenu, WorkspaceSwitcherComponent],
  templateUrl: './main-app.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './main-app.scss',
})
export class MainApp {
  private oidcSecurityService = inject(OidcSecurityService);
  private themeService = inject(ColorThemeService);
  private messagePreferences = inject(MessagePreferencesService);
  private workspaceService = inject(WorkspaceService);
  private router = inject(Router);

  protected title = 'Service Bus Browser';
  private readonly store = inject(Store);

  private readonly workspaceSwitcher = viewChild('workspaceSwitcher', {
    read: WorkspaceSwitcherComponent,
  });

  userData = toSignal(
    this.oidcSecurityService.userData$.pipe(map((r) => r.userData)),
  );
  userName = computed(() => this.userData()?.name);
  faUser = faUser;

  menuItems = computed<SbbMenuItem[]>(() => {
    // styleClass must be a live function, not a frozen string: the menu panel
    // renders in a CDK overlay that captures the item objects when it opens, so
    // a baked-in string can't update the checkmark while the panel is open.
    // resolve() re-invokes these on every signal-driven refresh.
    const selectionMarks = (selected: () => boolean, label: string) => ({
      label,
      styleClass: () => (selected() ? 'menu-item-selected' : ''),
    });

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
            icon: 'fa-solid fa-paper-plane',
            command: () => this.router.navigateByUrl(this.workspaceService.workspaceUrl('/messages/send')),
          },
          {
            label: 'Import',
            icon: 'fa-solid fa-upload',
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
            icon: 'fa-solid fa-desktop',
            items: [
              {
                ...selectionMarks(() => this.themeService.preference() === 'sync', 'Sync with OS'),
                icon: 'fa-solid fa-desktop',
                command: () => this.themeService.setPreference('sync'),
              },
              {
                ...selectionMarks(() => this.themeService.preference() === 'light', 'Light theme'),
                icon: 'fa-solid fa-sun',
                command: () => this.themeService.setPreference('light'),
              },
              {
                ...selectionMarks(() => this.themeService.preference() === 'dark', 'Dark theme'),
                icon: 'fa-solid fa-moon',
                command: () => this.themeService.setPreference('dark'),
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
                command: () => this.messagePreferences.setDefaultBodyView('raw'),
              },
              {
                ...selectionMarks(() => this.messagePreferences.defaultBodyView() === 'pretty', 'Pretty'),
                icon: 'fa-solid fa-wand-magic-sparkles',
                command: () => this.messagePreferences.setDefaultBodyView('pretty'),
              },
            ],
          },
          {
            label: 'About',
            icon: 'fa-solid fa-circle-info',
            command: () => this.router.navigateByUrl('/about'),
          },
        ],
      },
    ];
  });

  accountMenuItems: SbbMenuItem[] = [
    {
      label: 'Sign-out',
      icon: 'fa-solid fa-sign-out',
      command: () => {
        this.signOut();
      },
    },
  ];

  importMessages(): void {
    this.store.dispatch(messagesActions.startImportMessages());
  }

  signOut(): void {
    this.oidcSecurityService.logoff().subscribe();
  }
}
