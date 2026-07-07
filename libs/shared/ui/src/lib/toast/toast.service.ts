import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  DestroyRef,
  inject,
  Injectable,
  signal,
  Signal,
} from '@angular/core';
import { SbbToastContainer } from './toast-container.component';
import { SbbToast, SbbToastOptions } from './toast.models';

const DEFAULT_LIFE_MS = 3000;

/**
 * `SbbToastService` — shows transient, auto-dismissing notifications stacked
 * in a top-right overlay.
 *
 * Opinionated-minimal replacement for PrimeNG's `MessageService` +
 * `<p-toast>`, hand-built on `@angular/cdk/overlay` (no ngx-sonner, per the
 * migration's "no extra opinionated deps" rule). A single global overlay is
 * created lazily on the first toast and reused thereafter; the queue is a
 * signal so the container re-renders under zoneless change detection.
 *
 * ```ts
 * toasts.show({ severity: 'success', summary: 'Saved', detail: 'Queue created' });
 * toasts.error('Failed to save', problem.detail);
 * ```
 */
@Injectable({ providedIn: 'root' })
export class SbbToastService {
  private readonly overlay = inject(Overlay);
  private readonly destroyRef = inject(DestroyRef);

  private readonly toastsSignal = signal<SbbToast[]>([]);
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
  private overlayRef: OverlayRef | undefined;
  private nextId = 0;

  /** The current queue of visible toasts, newest last. */
  readonly toasts: Signal<readonly SbbToast[]> = this.toastsSignal.asReadonly();

  constructor() {
    this.destroyRef.onDestroy(() => this.clear());
  }

  /** Shows a toast and returns its id (usable with {@link dismiss}). */
  show(options: SbbToastOptions): number {
    this.ensureOverlay();

    const id = this.nextId++;
    const toast: SbbToast = { ...options, id };
    this.toastsSignal.update((toasts) => [...toasts, toast]);

    const life = options.life ?? DEFAULT_LIFE_MS;
    if (life > 0) {
      this.timers.set(
        id,
        setTimeout(() => this.dismiss(id), life),
      );
    }

    return id;
  }

  /** Dismisses the toast with the given id (no-op if already gone). */
  dismiss(id: number): void {
    const timer = this.timers.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    this.toastsSignal.update((toasts) => toasts.filter((t) => t.id !== id));
  }

  /** Removes all toasts. */
  clear(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    this.toastsSignal.set([]);
  }

  /** Convenience for a `success` toast. */
  success(summary: string, detail?: string): number {
    return this.show({ severity: 'success', summary, detail });
  }

  /** Convenience for an `error` toast. */
  error(summary: string, detail?: string): number {
    return this.show({ severity: 'error', summary, detail });
  }

  /** Convenience for an `info` toast. */
  info(summary: string, detail?: string): number {
    return this.show({ severity: 'info', summary, detail });
  }

  /** Convenience for a `warn` toast. */
  warn(summary: string, detail?: string): number {
    return this.show({ severity: 'warn', summary, detail });
  }

  private ensureOverlay(): void {
    if (this.overlayRef) {
      return;
    }
    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .global()
        .top('1rem')
        .right('1rem'),
      scrollStrategy: this.overlay.scrollStrategies.noop(),
      hasBackdrop: false,
      panelClass: 'sbb-toast-overlay-pane',
    });
    this.overlayRef.attach(new ComponentPortal(SbbToastContainer));
  }
}
