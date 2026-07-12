import { Dialog, DialogRef } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  model,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { take } from 'rxjs';

/**
 * `SbbDialog` — a declarative modal dialog controlled by a two-way `open`
 * model, replacing PrimeNG's `<p-dialog [(visible)]>` for call sites that
 * declare their dialog content inline rather than opening a separate
 * component via `SbbDialogService`.
 *
 * Built on `@angular/cdk/dialog`'s `Dialog.open()`, passed the component's
 * own content as a `TemplateRef` — this reuses the CDK overlay's focus trap,
 * centering, backdrop and Escape handling rather than hand-rolling an
 * overlay. Body content is projected via `<ng-content>`; an optional footer
 * (e.g. action buttons) projects via `<ng-content select="[sbbDialogFooter]">`
 * and is hidden automatically when empty.
 *
 * Shares the same `sbb-dialog-*` chrome/styling as the imperative
 * `SbbDialogContainer` (see `_dialog-chrome.scss`), so declarative and
 * imperative dialogs look identical.
 *
 * ```html
 * <sbb-dialog [(open)]="showDialog" header="Delete queue">
 *   <p>Are you sure you want to delete this queue?</p>
 *   <div sbbDialogFooter>
 *     <button (click)="showDialog.set(false)">Cancel</button>
 *     <button (click)="confirm()">Delete</button>
 *   </div>
 * </sbb-dialog>
 * ```
 */
@Component({
  selector: 'sbb-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
})
export class SbbDialog {
  private readonly dialog = inject(Dialog);

  private readonly dialogTemplate =
    viewChild.required<TemplateRef<unknown>>('dialogTemplate');

  /**
   * Two-way visibility. Set to `true` to open the dialog; the dialog sets
   * this back to `false` when it closes (close button, backdrop, or Escape).
   */
  readonly open = model<boolean>(false);

  /**
   * Optional header text. Shown in a header bar together with the close
   * button whenever `header` is set or `closable` is `true`.
   */
  readonly header = input<string>();

  /** Renders a backdrop and traps focus inside the dialog. Defaults to `true`. */
  readonly modal = input<boolean>(true);

  /**
   * Shows a close button and allows dismissal via the backdrop or Escape.
   * When `false`, the dialog can only be closed by setting `open` to `false`
   * externally.
   */
  readonly closable = input<boolean>(true);

  /** Optional fixed width (any CSS length, e.g. `'32rem'`). */
  readonly width = input<string>();

  /** Optional fixed height (any CSS length, e.g. `'24rem'`). */
  readonly height = input<string>();

  private cdkRef: DialogRef<void, unknown> | undefined;
  private destroyed = false;

  constructor() {
    effect(() => {
      if (this.open()) {
        this.openDialog();
      } else {
        this.closeDialog();
      }
    });

    inject(DestroyRef).onDestroy(() => {
      // Set before closing so the `closed` handler below doesn't try to
      // write to `open` (an `OutputRef`) after the component is destroyed.
      this.destroyed = true;
      this.closeDialog();
    });
  }

  /** Invoked by the close button in the projected header. */
  protected requestClose(): void {
    this.open.set(false);
    this.closeDialog();
  }

  private openDialog(): void {
    if (this.cdkRef) {
      return;
    }

    const closable = this.closable();
    const ref = this.dialog.open<void>(this.dialogTemplate(), {
      disableClose: !closable,
      hasBackdrop: this.modal(),
      backdropClass: 'sbb-dialog-backdrop',
      panelClass: 'sbb-dialog-pane',
      autoFocus: 'first-tabbable',
    });
    this.cdkRef = ref;

    // Backdrop/Escape/programmatic close: clear our handle and reflect the
    // closed state back into the `open` model. Guarded by the `cdkRef`
    // check in `closeDialog()` so this doesn't loop back into `ref.close()`.
    ref.closed.pipe(take(1)).subscribe(() => {
      this.cdkRef = undefined;
      if (!this.destroyed && this.open()) {
        this.open.set(false);
      }
    });
  }

  private closeDialog(): void {
    this.cdkRef?.close();
  }
}
