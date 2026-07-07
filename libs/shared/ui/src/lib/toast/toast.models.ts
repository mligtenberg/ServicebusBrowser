import { SbbMessageSeverity } from '../message';

/** Severity of a toast — reuses the shared message/severity vocabulary. */
export type SbbToastSeverity = SbbMessageSeverity;

/**
 * A toast to display. Distilled from the current `MessageService.add` call
 * sites (`save-feedback`, batch-resend): a `severity`, a bold `summary`, and
 * an optional longer `detail`.
 */
export interface SbbToastOptions {
  severity: SbbToastSeverity;
  summary: string;
  detail?: string;
  /**
   * Auto-dismiss delay in milliseconds. Defaults to 3000. Pass `0` to make
   * the toast sticky (dismissed only by the user or `clear()`).
   */
  life?: number;
}

/**
 * A live toast, as held in the service's queue and rendered by the
 * container. `id` is a stable per-session sequence number used for tracking
 * and dismissal.
 * @internal
 */
export interface SbbToast extends SbbToastOptions {
  readonly id: number;
}
