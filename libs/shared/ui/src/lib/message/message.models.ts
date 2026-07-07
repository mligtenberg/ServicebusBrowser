/**
 * Visual/semantic intent of the message. Derived from current `p-message`
 * `severity` call sites: info (default), success, warn, error.
 */
export type SbbMessageSeverity = 'info' | 'success' | 'warn' | 'error';
