import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Splitter } from 'primeng/splitter';
import { MenuItem, PrimeTemplate } from 'primeng/api';
import { Menubar } from 'primeng/menubar';
import { ScrollPanel } from 'primeng/scrollpanel';
import { Tab, TabList, Tabs } from 'primeng/tabs';
import { LogsListComponent } from '@service-bus-browser/logs-components';
import { Store } from '@ngrx/store';
import { LogsSelectors } from '@service-bus-browser/logs-store';
import { SidebarComponent } from './sidebar/sidebar.component';
import { Toast } from 'primeng/toast';
import {
  MessagesActions,
  MessagesSelectors,
} from '@service-bus-browser/messages-store';
import { selectRoute } from './ngrx/route.selectors';
import { UUID } from '@service-bus-browser/shared-contracts';
import { Button } from 'primeng/button';
import { ColorThemeService } from '@service-bus-browser/services';

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
  ],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'servicebus-browser-frontend';
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
          }
        }
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
          label: 'About',
          icon: 'pi pi-info-circle',
          routerLink: '/about'
        }
      ],
    }
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
