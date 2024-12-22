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
import { TopologySelectors } from '@service-bus-browser/topology-store';
import { TopologyTreeComponent } from '@service-bus-browser/topology-components';
import { Namespace, Queue, Topic, Subscription } from '@service-bus-browser/topology-contracts';

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
    TopologyTreeComponent,
  ],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'servicebus-browser-frontend';
  items = [
    {
      label: 'Connections',
    }
  ];
  store = inject(Store);

  logsOpened = signal(false);
  logs = this.store.selectSignal(LogsSelectors.selectLogs);
  namespaces = this.store.selectSignal(TopologySelectors.selectNamespaces);

  toggleLogs() {
    this.logsOpened.update((value) => !value);
  }

  onNamespaceSelected($event: { namespace: Namespace }) {
    console.log($event);
  }

  onQueueSelected($event: { namespaceId: string; queue: Queue }) {
    console.log($event);
  }

  onTopicSelected($event: { namespaceId: string; topic: Topic }) {
    console.log($event);
  }

  onSubscriptionSelected($event: { namespaceId: string; topicId: string, subscription: Subscription }) {
    console.log($event);
  }
}
