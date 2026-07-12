import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  TemplateRef,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { isSbbMenuSeparator, SbbMenuItem, SbbMenuSeparator } from '../menu';

/**
 * `SbbMenu` — a popup menu built from an `SbbMenuItem` model and opened
 * imperatively at a pointer position or anchored to an element.
 *
 * Opinionated-minimal replacement for PrimeNG's `<p-menu [popup]="true">`,
 * which is placed invisibly in the template and shown from a separate trigger
 * via `menu.show($event)`. This mirrors that ergonomic with `open(origin)` /
 * `close()`:
 *
 * ```html
 * <sbb-menu #menu [model]="rowMenu()" />
 * <sbb-button icon="ellipsis" (click)="menu.open($event)" />
 * ```
 *
 * The panel is a `@angular/cdk/menu` `cdkMenu` (keyboard nav, submenu
 * positioning, ARIA) rendered into a `@angular/cdk/overlay` overlay. A
 * `cdkMenu` with no trigger ancestor self-provides its menu stack, so opening
 * it imperatively works. Nested `items` render as submenus via the
 * self-recursive panel template. CDK types never surface in the public API.
 */
@Component({
  selector: 'sbb-menu',
  standalone: true,
  imports: [CdkMenu, CdkMenuItem, CdkMenuTrigger],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './popup-menu.component.html',
  styleUrl: './popup-menu.component.scss',
})
export class SbbMenu<T = void> {
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);

  /** The menu structure to render. */
  readonly model = input.required<SbbMenuItem<T>[]>();

  /** Contextual value passed to each chosen item's `onSelect`. */
  readonly data = input<T>();

  private readonly panel =
    viewChild.required<TemplateRef<unknown>>('panel');

  private overlayRef: OverlayRef | undefined;
  private subscriptions = new Subscription();

  constructor() {
    inject(DestroyRef).onDestroy(() => this.close());
  }

  /**
   * Opens the menu. Pass the triggering `MouseEvent` (anchors to the clicked
   * element, or the pointer if unavailable) or an `HTMLElement` to anchor to.
   */
  open(origin: MouseEvent | HTMLElement): void {
    this.close();
    this.subscriptions = new Subscription();

    const anchor =
      origin instanceof MouseEvent
        ? origin.currentTarget instanceof HTMLElement
          ? origin.currentTarget
          : { x: origin.clientX, y: origin.clientY }
        : origin;

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(anchor)
      .withPositions([
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
        { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' },
        { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom' },
      ]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.close(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
    });

    this.overlayRef.attach(
      new TemplatePortal(this.panel(), this.viewContainerRef, {
        $implicit: this.model(),
      }),
    );

    this.subscriptions.add(
      this.overlayRef.backdropClick().subscribe(() => this.close()),
    );
    this.subscriptions.add(
      this.overlayRef.keydownEvents().subscribe((event) => {
        if (event.key === 'Escape') {
          this.close();
        }
      }),
    );
  }

  /** Closes the menu (no-op if already closed). */
  close(): void {
    this.subscriptions.unsubscribe();
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
  }

  /** Template type guard so the recursive template can branch on separators. */
  protected isSeparator(item: SbbMenuItem<T>): item is SbbMenuSeparator {
    return isSbbMenuSeparator(item);
  }

  /** Invokes the chosen item's `onSelect` or `command` with the contextual data, then closes. */
  protected invoke(item: SbbMenuItem<T>): void {
    if (isSbbMenuSeparator(item)) {
      return;
    }
    item.onSelect?.(this.data() as T);
    if ('command' in item && typeof item.command === 'function') {
      item.command({ item });
    }
    this.close();
  }

  /** Resolves value that can be either a plain type or a signal/function. */
  protected resolve<V>(value: V | (() => V) | undefined): V | undefined {
    if (typeof value === 'function') {
      return (value as () => V)();
    }
    return value;
  }
}
