import { Component, effect, inject, input, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Splitter } from 'primeng/splitter';
import { MenuItem, PrimeTemplate } from 'primeng/api';
import { Menubar } from 'primeng/menubar';
import { ScrollPanel } from 'primeng/scrollpanel';
import { Tab, TabList, Tabs } from 'primeng/tabs';
import { LogsListComponent } from '@service-bus-browser/logs-components';
import { Store } from '@ngrx/store';
import { LogsSelectors } from '@service-bus-browser/logs-store';
import { SidebarComponent } from '../sidebar/sidebar';
import { Toast } from 'primeng/toast';
import {
  MessagesActions,
  MessagesSelectors,
} from '@service-bus-browser/messages-store';
import { selectRoute } from '../ngrx/route.selectors';
import { UUID } from '@service-bus-browser/shared-contracts';
import { Button } from 'primeng/button';
import { ColorThemeService } from '@service-bus-browser/services';
import { NgClass } from '@angular/common';

interface ElectronWindow {
  electron?: {
    platform?: string;
    onFullScreenChanged?: (callback: (fullscreen: boolean) => void) => void;
    checkForUpdates?: () => Promise<void>;
  };
}

@Component({
  imports: [
    RouterModule,
    LogsListComponent,
    Splitter,
    PrimeTemplate,
    Menubar,
    ScrollPanel,
    Tabs,
    TabList,
    Tab,
    SidebarComponent,
    Toast,
    Button,
    NgClass,
  ],
  selector: 'lib-main-ui',
  templateUrl: './main-ui.html',
  styleUrl: './main-ui.scss',
})
export class MainUiComponent {
  title = 'servicebus-browser-frontend';
  private electron = (window as unknown as ElectronWindow).electron;
  isMac = input<boolean>();

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

  store = inject(Store);
  themeService = inject(ColorThemeService);
  logsOpened = signal(false);

  currentRoute = this.store.selectSignal(selectRoute);
  logs = this.store.selectSignal(LogsSelectors.selectLogs);
  messagePages = this.store.selectSignal(MessagesSelectors.selectPages);
  darkMode = this.themeService.darkMode;

  toggleLogs() {
    this.logsOpened.update((value) => !value);
  }

  closePage(pageId: UUID, event: Event) {
    this.store.dispatch(MessagesActions.closePage({ pageId: pageId }));
    event.stopPropagation();
  }

  constructor() {
    this.setDarkMode(this.darkMode());
    effect(() => this.setDarkMode(this.darkMode()));
    this.electron?.onFullScreenChanged?.((full) => {
      document.body.classList.toggle('fullscreen', full);
    });
  }

  importMessages(): void {
    this.store.dispatch(MessagesActions.importMessages());
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
