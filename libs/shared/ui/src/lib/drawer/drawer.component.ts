import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { Overlay } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  model,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { take } from 'rxjs';

/** Edge the drawer is anchored to. */
export type SbbDrawerPosition = 'left' | 'right';

/**
 * `SbbDrawer` — a declarative, edge-anchored, full-height modal panel
 * controlled by a two-way `open` model. Replaces * `<p-drawer [(visible)]>` for inline-declared slide-in panels.
 *
 * Built on `@angular/cdk/dialog` (same overlay/focus-trap/backdrop/Escape
 * machinery as {@link SbbDialog}), but anchored to a screen edge and stretched
 * to the full viewport height via a CDK global position strategy rather than
 * centered. Body content projects via `<ng-content>`; an optional footer
 * projects via `<ng-content select="[sbbDrawerFooter]">`.
 *
 * ```html
 * <sbb-drawer [(open)]="visible" header="Filter" [width]="'900px'">
 *   <p>…</p>
 * </sbb-drawer>
 * ```
 */
@Component({
  selector: 'sbb-drawer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './drawer.component.html',
  styleUrl: './drawer.component.scss',
})
export class SbbDrawer {
  private readonly dialog = inject(Dialog);
  private readonly overlay = inject(Overlay);

  private readonly drawerTemplate =
    viewChild.required<TemplateRef<unknown>>('drawerTemplate');

  /** Two-way visibility (opens on `true`, resets to `false` on close). */
  readonly open = model<boolean>(false);

  /** Optional header text shown with the close button. */
  readonly header = input<string>();

  /** Renders a backdrop and traps focus. Defaults to `true`. */
  readonly modal = input<boolean>(true);

  /** Shows a close button and allows backdrop/Escape dismissal. Default `true`. */
  readonly closable = input<boolean>(true);

  /** Which edge to anchor to. Defaults to `'right'`. */
  readonly position = input<SbbDrawerPosition>('right');

  /** Panel width (any CSS length). Defaults to `'400px'`. */
  readonly width = input<string>('400px');

  readonly isClosing = signal(false);

  private cdkRef: DialogRef<void, unknown> | undefined;
  private destroyed = false;

  constructor() {
    effect(() => {
      if (this.open()) {
        this.openDrawer();
      } else {
        this.closeDrawer();
      }
    });

    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      this.closeDrawer();
    });
  }

  requestClose(): void {
    console.log('[SbbDrawer] requestClose called, starting close animation');
    this.startCloseAnimation();
  }

  private startCloseAnimation(): void {
    if (this.isClosing()) {
      return;
    }
    this.isClosing.set(true);
    setTimeout(() => {
      this.open.set(false);
      this.closeDrawer();
      this.isClosing.set(false);
    }, 200); // 200ms matches the slow transition duration
  }

  private openDrawer(): void {
    if (this.cdkRef) {
      return;
    }

    const strategy = this.overlay.position().global().top('0');
    if (this.position() === 'left') {
      strategy.left('0');
    } else {
      strategy.right('0');
    }

    const ref = this.dialog.open<void>(this.drawerTemplate(), {
      disableClose: true, // handle manual closure to allow exit animations
      hasBackdrop: this.modal(),
      backdropClass: 'sbb-dialog-backdrop',
      panelClass: ['sbb-drawer-pane', `sbb-drawer-pane--${this.position()}`],
      positionStrategy: strategy,
      autoFocus: 'first-tabbable',
    });
    this.cdkRef = ref;

    // Handle backdrop click manual close
    if (this.modal() && this.closable()) {
      ref.backdropClick.pipe(take(1)).subscribe(() => {
        this.startCloseAnimation();
      });
    }

    // Handle escape key manual close
    if (this.closable()) {
      ref.keydownEvents.subscribe((event) => {
        if (event.key === 'Escape') {
          this.startCloseAnimation();
        }
      });
    }

    ref.closed.pipe(take(1)).subscribe(() => {
      this.cdkRef = undefined;
      this.isClosing.set(false);
      if (!this.destroyed && this.open()) {
        this.open.set(false);
      }
    });
  }

  private closeDrawer(): void {
    this.cdkRef?.close();
  }
}
