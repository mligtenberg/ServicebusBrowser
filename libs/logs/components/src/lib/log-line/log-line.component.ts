import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogLine } from '@service-bus-browser/logs-contracts';

@Component({
  selector: 'sbb-logs-log-line',
  imports: [CommonModule],
  templateUrl: './log-line.component.html',
  styleUrl: './log-line.component.scss',
})
export class LogLineComponent {
  logLine = input.required<LogLine>();
  logLineColor = computed<string>(() => {
    const logLevel = this.logLine().severity;
    switch (logLevel) {
      case 'info':
        return 'var(--p-blue-400)';
      case 'warn':
        return 'var(--p-amber-500)';
      case 'error':
        return 'var(--p-red-400)';
      case 'critical':
        return 'var(--p-red-900)';
      default:
        return 'var(--p-slate-400)';
    }
  });
}
