import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Splitter } from 'primeng/splitter';
import { MenuItem, MenuItemCommandEvent, PrimeTemplate } from 'primeng/api';
import { Menubar } from 'primeng/menubar';
import { ScrollPanel } from 'primeng/scrollpanel';
import { Tab, TabList, Tabs } from 'primeng/tabs';
import { LogsListComponent } from '@service-bus-browser/logs-components';
import { Store } from '@ngrx/store';
import { LogsSelectors } from '@service-bus-browser/logs-store';
import { TopologySelectors } from '@service-bus-browser/topology-store';
import { TopologyTreeComponent } from '@service-bus-browser/topology-components';
import { Namespace, Queue, Topic, Subscription } from '@service-bus-browser/topology-contracts';
import { SbbMenuItem } from '@service-bus-browser/shared-contracts';
import { SidebarComponent } from './sidebar/sidebar.component';

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
        }
      ]
    },
  ];

  store = inject(Store);

  logsOpened = signal(false);
  logs = this.store.selectSignal(LogsSelectors.selectLogs);

  toggleLogs() {
    this.logsOpened.update((value) => !value);
  }
}
