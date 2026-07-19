import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogLine } from '@service-bus-browser/logs-contracts';

@Component({
  selector: 'sbb-logs-log-line',
  imports: [CommonModule],
  templateUrl: './log-line.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './log-line.component.scss',
})
export class LogLineComponent {
  logLine = input.required<LogLine>();
  logLineColor = computed<string>(() => {
    const logLevel = this.logLine().severity;
    switch (logLevel) {
      case 'info':
        return 'var(--sbb-info)';
      case 'warn':
        return 'var(--sbb-warning)';
      case 'error':
        return 'var(--sbb-danger)';
      case 'critical':
        return 'var(--sbb-danger)';
      default:
        return 'var(--sbb-text-muted)';
    }
  });
}
