import { DialogRef } from '@angular/cdk/dialog';
import { Observable, Subject, take } from 'rxjs';

/**
 * Handle to an open `SbbDialogService` dialog.
 *
 * Returned by `SbbDialogService.open()` and injectable inside the dialog's
 * content component (`inject(SbbDialogRef)`), mirroring the previous
 * `DynamicDialogRef` idiom. The content component calls `close(result)` to
 * dismiss and return a value to the opener; the opener observes `closed`
 * (parity with `onClose`).
 *
 * The underlying `@angular/cdk/dialog` `DialogRef` is an implementation
 * detail bound via {@link _bind} and never exposed through the public API.
 */
export class SbbDialogRef<R = unknown> {
  private cdkRef?: DialogRef<R, unknown>;
  private readonly closedSubject = new Subject<R | undefined>();

  /**
   * Emits exactly once with the dialog result — the value passed to
   * `close()`, or `undefined` when dismissed via backdrop/escape — then
   * completes.
   */
  readonly closed: Observable<R | undefined> = this.closedSubject.asObservable();

  /**
   * Closes the dialog, returning `result` to the opener via {@link closed}.
   * No-op if the dialog is already closed.
   */
  close(result?: R): void {
    this.cdkRef?.close(result);
  }

  /**
   * Links this ref to the CDK dialog that backs it. Called by
   * `SbbDialogService` immediately after opening; not part of the public API.
   * @internal
   */
  _bind(cdkRef: DialogRef<R, unknown>): void {
    this.cdkRef = cdkRef;
    cdkRef.closed.pipe(take(1)).subscribe((result) => {
      this.closedSubject.next(result);
      this.closedSubject.complete();
    });
  }
}
