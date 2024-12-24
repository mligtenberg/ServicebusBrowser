export type LogLineSeverity = 'verbose' | 'info' | 'warn' | 'error' | 'critical';
export interface LogLine {
  severity: LogLineSeverity;
  message: string;
  loggedAt: Date;
  context?: any;
}
