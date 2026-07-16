import { ComponentType } from '@angular/cdk/portal';
import { SbbDialogRef } from './dialog-ref';

/**
 * Options for `SbbDialogService.open()`.
 *
 * Opinionated-minimal surface derived from the current `DialogService.open`
 * call sites (confirmation + prompt services): a header `title`, whether the
 * dialog is dismissible, and `inputs` applied to the content component
 * (the previous `inputValues`).
 */
export interface SbbDialogConfig {
  /** Header text. When omitted (and not `closable`), no header bar is shown. */
  title?: string;

  /**
   * When `true` (default) the dialog shows a close button and can be
   * dismissed via the backdrop or the escape key. When `false` it can only
   * be closed programmatically via `SbbDialogRef.close()`.
   */
  closable?: boolean;

  /**
   * Values applied to the content component's inputs after it is created
   * (via `ComponentRef.setInput`), keyed by input name. Replaces * `inputValues`.
   */
  inputs?: Record<string, unknown>;

  /** Optional fixed width (any CSS length, e.g. `'32rem'`). */
  width?: string;
}

/**
 * Data handed to the internal `SbbDialogContainer` through the CDK
 * `DIALOG_DATA` token. Not part of the public API.
 * @internal
 */
export interface SbbDialogInternalData {
  component: ComponentType<unknown>;
  inputs?: Record<string, unknown>;
  title?: string;
  closable: boolean;
  ref: SbbDialogRef<unknown>;
}
