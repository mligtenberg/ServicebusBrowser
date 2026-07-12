import { Component, contentChild, inject, input, signal, TemplateRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LogsListComponent } from '@service-bus-browser/logs-components';
import { Store } from '@ngrx/store';
import { LogsSelectors } from '@service-bus-browser/logs-store';
import { SidebarComponent } from '../sidebar/sidebar';
import { ColorThemeService } from '@service-bus-browser/services';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { PageNavigator } from '../page-navigator/page-navigator';
import { contentResize } from '@service-bus-browser/actions';
import {
  SbbMenubar,
  SbbMenuItem,
  SbbScrollPanel,
  SbbSplitter,
  SbbSplitterPanel,
} from '@service-bus-browser/shared-ui';

@Component({
  imports: [
    RouterModule,
    LogsListComponent,
    SbbSplitter,
    SbbSplitterPanel,
    SbbMenubar,
    SbbScrollPanel,
    SidebarComponent,
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

  menuItems = input.required<SbbMenuItem<unknown>[]>();

  store = inject(Store);
  themeService = inject(ColorThemeService);
  logsOpened = signal(false);

  logs = this.store.selectSignal(LogsSelectors.selectLogs);
  darkMode = this.themeService.darkMode;

  toggleLogs() {
    this.logsOpened.update((value) => !value);
  }

  onResizeEnd() {
    this.store.dispatch(contentResize());
  }
}
