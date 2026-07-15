import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { SbbPopover } from '../popover';
import { isSbbMenuSeparator, SbbMenuItem, SbbMenuSeparator } from '../menu';

let nextMenuId = 0;

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
 * Built on {@link SbbPopover} (native HTML Popover API + CSS anchor
 * positioning), not a body-portaled CDK overlay: because the panel stays a DOM
 * descendant, a menu opened inside another popover forms a native popover
 * ancestor chain, so choosing an item never light-dismisses the surrounding
 * popover. Keyboard navigation uses roving DOM focus over the `role="menuitem"`
 * buttons; submenus are themselves nested `SbbPopover`s. CDK types no longer
 * surface anywhere.
 */
@Component({
  selector: 'sbb-menu',
  standalone: true,
  imports: [SbbPopover, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './popup-menu.component.html',
  styleUrl: './popup-menu.component.scss',
})
export class SbbMenu<T = void> {
  private readonly document = inject(DOCUMENT);

  /** The menu structure to render. */
  readonly model = input.required<SbbMenuItem<T>[]>();

  /** Contextual value passed to each chosen item's `onSelect`. */
  readonly data = input<T>();

  private readonly popover = viewChild.required<SbbPopover>('root');

  /** Id stamped on the root panel so focus queries stay scoped to this instance. */
  protected readonly menuPanelId = `sbb-menu-panel-${nextMenuId++}`;

  /** A transient zero-size anchor created when opened at a raw pointer point. */
  private pointAnchor: HTMLElement | undefined;

  constructor() {
    // Only the body-appended point anchor needs manual cleanup; the popover
    // panel is torn down with this component's view. Calling close() here would
    // emit the popover's `closed` output mid-destroy and throw.
    inject(DestroyRef).onDestroy(() => this.removePointAnchor());
  }

  /** Whether the menu is currently open. */
  protected isOpen(): boolean {
    return this.popover().isOpen();
  }

  /**
   * Opens the menu. Pass the triggering `MouseEvent` (anchors to the clicked
   * element, or a zero-size anchor at the pointer if there is none), an
   * `HTMLElement` to anchor to, or a `{ x, y }` viewport point (context-menu
   * style — anchors a zero-size element there).
   */
  open(origin: MouseEvent | HTMLElement | { x: number; y: number }): void {
    this.popover().open(this.resolveAnchor(origin));
  }

  /** Closes the menu (no-op if already closed). */
  close(): void {
    this.popover().close();
  }

  /** Anchor resolution: element as-is; MouseEvent → its element, else a point anchor. */
  private resolveAnchor(
    origin: MouseEvent | HTMLElement | { x: number; y: number },
  ): HTMLElement {
    if (origin instanceof HTMLElement) {
      return origin;
    }
    if (origin instanceof MouseEvent) {
      if (origin.currentTarget instanceof HTMLElement) {
        return origin.currentTarget;
      }
      return this.createPointAnchor(origin.clientX, origin.clientY);
    }
    return this.createPointAnchor(origin.x, origin.y);
  }

  /** Builds a zero-size, fixed-position anchor at a pointer location. */
  private createPointAnchor(x: number, y: number): HTMLElement {
    this.removePointAnchor();
    const anchor = this.document.createElement('div');
    anchor.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:0;height:0;`;
    this.document.body.appendChild(anchor);
    this.pointAnchor = anchor;
    return anchor;
  }

  private removePointAnchor(): void {
    this.pointAnchor?.remove();
    this.pointAnchor = undefined;
  }

  /** Panel opened — move focus to the first enabled item. */
  protected onOpened(): void {
    queueMicrotask(() => this.firstItem()?.focus());
  }

  /** Panel closed — drop any transient point anchor. */
  protected onClosed(): void {
    this.removePointAnchor();
  }

  private firstItem(): HTMLElement | null {
    const panel = this.document.getElementById(this.menuPanelId);
    return (
      panel?.querySelector<HTMLElement>(
        'button.sbb-menu-panel__item:not([aria-disabled="true"])',
      ) ?? null
    );
  }

  /** Roving-focus navigation within the panel that owns the focused item. */
  protected onKeydown(event: KeyboardEvent): void {
    const panel = event.currentTarget as HTMLElement;
    const items = Array.from(
      panel.querySelectorAll<HTMLButtonElement>(
        ':scope > button.sbb-menu-panel__item',
      ),
    ).filter((item) => item.getAttribute('aria-disabled') !== 'true');
    if (items.length === 0) {
      return;
    }
    const active = this.document.activeElement as HTMLElement | null;
    const current = active ? items.indexOf(active as HTMLButtonElement) : -1;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        event.stopPropagation();
        items[(current + 1 + items.length) % items.length].focus();
        break;
      case 'ArrowUp':
        event.preventDefault();
        event.stopPropagation();
        items[(current - 1 + items.length) % items.length].focus();
        break;
      case 'Home':
        event.preventDefault();
        event.stopPropagation();
        items[0].focus();
        break;
      case 'End':
        event.preventDefault();
        event.stopPropagation();
        items[items.length - 1].focus();
        break;
    }
  }

  /** Template type guard so the recursive template can branch on separators. */
  protected isSeparator(item: SbbMenuItem<T>): item is SbbMenuSeparator {
    return isSbbMenuSeparator(item);
  }

  /** Invokes the chosen item's `onSelect` or `command` with the contextual data, then closes. */
  protected invoke(item: SbbMenuItem<T>): void {
    if (isSbbMenuSeparator(item) || this.resolve(item.disabled)) {
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
