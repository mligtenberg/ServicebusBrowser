import { Component, computed, effect, inject, signal } from '@angular/core';
import { MainUiComponent } from '@service-bus-browser/main-ui';
import { ColorThemeService, WorkspaceService } from '@service-bus-browser/services';
import { MenuItem } from 'primeng/api';
import { messagesActions } from '@service-bus-browser/messages-store';
import { Store } from '@ngrx/store';
import { NgStyle } from '@angular/common';

interface ElectronWindow {
  electron?: {
    platform?: string;
    onFullScreenChanged?: (callback: (fullscreen: boolean) => void) => void;
    checkForUpdates?: () => Promise<void>;
  };
}

const AVATAR_COLORS = [
  '#5B9BD5', '#ED7D31', '#A9D18E', '#FF0000',
  '#FFC000', '#00B0F0', '#7030A0', '#70AD47',
];

function workspaceAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

@Component({
  imports: [MainUiComponent, NgStyle],
  selector: 'app-main-shell',
  templateUrl: './main-shell.html',
  styleUrl: './main-shell.scss',
})
export class MainShell {
  private electron = (window as unknown as ElectronWindow).electron;
  isMac = this.electron?.platform === 'darwin';

  store = inject(Store);
  workspaceService = inject(WorkspaceService);

  fullscreen = signal<boolean>(false);
  windowControlSpacing = computed(() => this.isMac && !this.fullscreen());

  themeService = inject(ColorThemeService);
  darkMode = this.themeService.darkMode;

  activeWorkspace = this.workspaceService.activeWorkspace;
  workspaceAvatarColor = computed(() => {
    const ws = this.activeWorkspace();
    return ws ? workspaceAvatarColor(ws.id) : '#888';
  });
  workspaceInitial = computed(() => {
    const ws = this.activeWorkspace();
    return ws ? ws.name.charAt(0).toUpperCase() : '?';
  });

  menuItems: MenuItem[] = [
    {
      label: 'Connections',
      items: [
        {
          label: 'Add Connection',
          icon: 'pi pi-plus',
          routerLink: '/connections/add',
        },
      ],
    },
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
              label: 'Sync with OS',
              icon: 'pi pi-desktop',
              command: () => this.themeService.setPreference('sync'),
            },
            {
              label: 'Light theme',
              icon: 'pi pi-sun',
              command: () => this.themeService.setPreference('light'),
            },
            {
              label: 'Dark theme',
              icon: 'pi pi-moon',
              command: () => this.themeService.setPreference('dark'),
            },
          ],
        },
        {
          label: 'Search for Updates',
          icon: 'pi pi-refresh',
          command: () => this.electron?.checkForUpdates?.(),
        },
        {
          label: 'About',
          icon: 'pi pi-info-circle',
          routerLink: '/about',
        },
      ],
    },
  ];

  constructor() {
    this.setDarkMode(this.darkMode());
    effect(() => this.setDarkMode(this.darkMode()));
    this.electron?.onFullScreenChanged?.((full) => {
      this.fullscreen.set(full);
    });
  }

  importMessages(): void {
    this.store.dispatch(messagesActions.startImportMessages());
  }

  setDarkMode(darkMode: boolean) {
    const element = document.querySelector('html');
    const darkModeSet = element?.classList.contains('darkMode');
    if (darkMode && !darkModeSet) {
      element?.classList.add('darkMode');
    }

    if (!darkMode && darkModeSet) {
      element?.classList.remove('darkMode');
    }
  }
}
