import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogLine } from '@service-bus-browser/logs-contracts';
import { SbbVirtualScroller } from '@service-bus-browser/shared-ui';
import { LogLineComponent } from '../log-line/log-line.component';
import { ColorThemeService } from '@service-bus-browser/services';

@Component({
  selector: 'sbb-logs-list',
  imports: [CommonModule, SbbVirtualScroller, LogLineComponent],
  templateUrl: './logs-list.component.html',
  styleUrl: './logs-list.component.scss',
})
export class LogsListComponent {
  logs = input.required<LogLine[]>();
  darkMode = inject(ColorThemeService).darkMode;
}
