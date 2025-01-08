import { Component, inject, signal } from '@angular/core';
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
import { MessagesSelectors } from '@service-bus-browser/messages-store';
import { selectRoute } from './ngrx/route.selectors';

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
  ];

  activeRoute = inject(ActivatedRoute);
  store = inject(Store);
  logsOpened = signal(false);

  currentRoute = this.store.selectSignal(selectRoute);
  logs = this.store.selectSignal(LogsSelectors.selectLogs);
  messagePages = this.store.selectSignal(MessagesSelectors.selectPages);

  toggleLogs() {
    this.logsOpened.update((value) => !value);
  }
}
