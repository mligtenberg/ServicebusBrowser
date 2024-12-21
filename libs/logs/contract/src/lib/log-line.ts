export interface LogLine {
  severity: 'verbose' | 'info' | 'warn' | 'error' | 'critical';
  message: string;
  loggedAt: Date;
  context?: any;
}
