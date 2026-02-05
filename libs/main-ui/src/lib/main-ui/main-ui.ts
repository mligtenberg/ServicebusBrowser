import { Component, contentChild, effect, inject, input, signal, TemplateRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Splitter } from 'primeng/splitter';
import { MenuItem, PrimeTemplate } from 'primeng/api';
import { Menubar } from 'primeng/menubar';
import { ScrollPanel } from 'primeng/scrollpanel';
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
import { ColorThemeService } from '@service-bus-browser/services';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { PageNavigator } from '../page-navigator/page-navigator';

@Component({
  imports: [
    RouterModule,
    LogsListComponent,
    Splitter,
    PrimeTemplate,
    Menubar,
    ScrollPanel,
    SidebarComponent,
    Toast,
    NgClass,
    NgTemplateOutlet,
    PageNavigator,
  ],
  selector: 'lib-main-ui',
  templateUrl: './main-ui.html',
  styleUrl: './main-ui.scss',
})
export class MainUiComponent {
  title = 'servicebus-browser-frontend';
  electronWindowControlSpacing = input<boolean>(false);
  useLowProfileMenu = input<boolean>(false);

  menuEnd = contentChild('menuEnd', { read: TemplateRef });
  menuStart = contentChild('menuStart', { read: TemplateRef });

  menuItems = input.required<MenuItem[]>();

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
}
