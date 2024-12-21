import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Splitter } from 'primeng/splitter';
import { PrimeTemplate } from 'primeng/api';
import { Menubar } from 'primeng/menubar';
import { ScrollPanel } from 'primeng/scrollpanel';
import { Tab, TabList, Tabs } from 'primeng/tabs';
import { LogsListComponent } from '@service-bus-browser/logs-components';
import { Store } from '@ngrx/store';
import { LogsSelectors } from '@service-bus-browser/logs-store';

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
  ],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'servicebus-browser-frontend';
  items = [
    {
      label: 'Home',
      icon: 'pi pi-home',
    },
    {
      label: 'Projects',
      icon: 'pi pi-search',
      items: [
        {
          label: 'Core',
          icon: 'pi pi-bolt',
          shortcut: '⌘+S',
        },
        {
          label: 'Blocks',
          icon: 'pi pi-server',
          shortcut: '⌘+B',
        },
        {
          separator: true,
        },
        {
          label: 'UI Kit',
          icon: 'pi pi-pencil',
          shortcut: '⌘+U',
        },
      ],
    },
  ];
  store = inject(Store);

  logsOpened = signal(false);
  logs = this.store.selectSignal(LogsSelectors.selectLogs);

  toggleLogs() {
    this.logsOpened.update((value) => !value);
  }
}
