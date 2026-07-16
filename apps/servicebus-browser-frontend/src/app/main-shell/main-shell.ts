import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MainUiComponent } from '@service-bus-browser/main-ui';
import { ColorThemeService, MessagePreferencesService } from '@service-bus-browser/services';
import { SbbMenuItem } from '@service-bus-browser/shared-ui';
import { messagesActions } from '@service-bus-browser/messages-store';
import { Store } from '@ngrx/store';
import { WorkspaceSwitcherComponent } from './workspace-switcher/workspace-switcher';

interface ElectronWindow {
  electron?: {
    platform?: string;
    onFullScreenChanged?: (callback: (fullscreen: boolean) => void) => void;
    checkForUpdates?: () => Promise<void>;
  };
}

@Component({
  imports: [MainUiComponent, WorkspaceSwitcherComponent],
  selector: 'app-main-shell',
  templateUrl: './main-shell.html',
  styleUrl: './main-shell.scss',
})
export class MainShell {
  private electron = (window as unknown as ElectronWindow).electron;
  isMac = this.electron?.platform === 'darwin';

  private readonly router = inject(Router);
  store = inject(Store);

  fullscreen = signal<boolean>(false);
  windowControlSpacing = computed(() => this.isMac && !this.fullscreen());

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
        label: 'Connections',
        items: [
          {
            label: 'Add Connection',
            icon: 'fa-solid fa-plus',
            onSelect: () => this.router.navigateByUrl('/connections/add'),
          },
        ],
      },
      {
        label: 'Messages',
        items: [
          {
            label: 'Send',
            icon: 'fa-solid fa-paper-plane',
            onSelect: () => this.router.navigateByUrl('/messages/send'),
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
            label: 'About',
            icon: 'fa-solid fa-circle-info',
            onSelect: () => this.router.navigateByUrl('/about'),
          },
        ],
      },
    ];
  });

  constructor() {
    this.electron?.onFullScreenChanged?.((full) => {
      this.fullscreen.set(full);
    });
  }

  importMessages(): void {
    this.store.dispatch(messagesActions.startImportMessages());
  }
}
