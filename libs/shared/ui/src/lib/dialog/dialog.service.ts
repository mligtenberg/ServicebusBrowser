import { Dialog } from '@angular/cdk/dialog';
import { ComponentType } from '@angular/cdk/portal';
import { inject, Injectable } from '@angular/core';
import { SbbDialogContainer } from './dialog-container.component';
import { SbbDialogRef } from './dialog-ref';
import { SbbDialogConfig, SbbDialogInternalData } from './dialog.models';

/**
 * `SbbDialogService` — opens modal dialogs programmatically, returning an
 * `SbbDialogRef` whose `closed` observable resolves with the dialog result.
 *
 * Opinionated-minimal replacement for PrimeNG's `DialogService` /
 * `DynamicDialog`, built on `@angular/cdk/dialog`. It renders the caller's
 * content component inside a themed `SbbDialogContainer` (header + close
 * button + backdrop) and provides the `SbbDialogRef` to that component via
 * DI so it can close itself and return a value. This service backs the
 * higher-level confirmation and prompt dialogs.
 *
 * ```ts
 * const ref = dialog.open<MyBody, boolean>(MyBody, {
 *   title: 'Delete queue',
 *   inputs: { message: 'Are you sure?' },
 * });
 * const confirmed = await firstValueFrom(ref.closed);
 * ```
 *
 * brain/CDK types never appear in the public API — callers see only
 * `SbbDialogConfig` and `SbbDialogRef`.
 */
@Injectable({ providedIn: 'root' })
export class SbbDialogService {
  private readonly dialog = inject(Dialog);

  /**
   * Opens `component` in a modal dialog.
   * @typeParam C The content component type.
   * @typeParam R The result type produced when the dialog closes.
   */
  open<C, R = unknown>(
    component: ComponentType<C>,
    config: SbbDialogConfig = {},
  ): SbbDialogRef<R> {
    const closable = config.closable ?? true;
    const ref = new SbbDialogRef<R>();

    const cdkRef = this.dialog.open<R, SbbDialogInternalData, SbbDialogContainer>(
      SbbDialogContainer,
      {
        disableClose: !closable,
        hasBackdrop: true,
        backdropClass: 'sbb-dialog-backdrop',
        panelClass: 'sbb-dialog-pane',
        width: config.width,
        autoFocus: 'first-tabbable',
        data: {
          component: component as ComponentType<unknown>,
          inputs: config.inputs,
          title: config.title,
          closable,
          ref,
        },
      },
    );

    ref._bind(cdkRef);
    return ref;
  }
}
