import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { SbbMenuItem } from '../menu';
import { SbbMenu } from '../popup-menu';

/**
 * `SbbContextMenu` — wraps arbitrary content and shows a right-click context
 * menu built from an `SbbMenuItem` model, invoking each item's `onSelect`
 * with the bound contextual `data`.
 *
 * Opinionated-minimal replacement for the previous `p-contextMenu`
 * wrapper. Wrap the trigger content in the component:
 *
 * ```html
 * <sbb-context-menu [model]="nodeMenu" [data]="node">
 *   <span>{{ node.name }}</span>
 * </sbb-context-menu>
 * ```
 *
 * Delegates the actual menu to {@link SbbMenu} (native HTML Popover API + CSS
 * anchor positioning), opened at the pointer on `contextmenu`. Because the menu
 * panel stays a DOM descendant rather than a body-portaled overlay, a context
 * menu nested inside another popover no longer light-dismisses it. CDK types no
 * longer surface anywhere.
 *
 * The trigger host uses `display: contents` so it does not perturb the
 * projected content's layout.
 */
@Component({
  selector: 'sbb-context-menu',
  standalone: true,
  imports: [SbbMenu],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './context-menu.component.html',
  styleUrl: './context-menu.component.scss',
  host: { class: 'sbb-context-menu-host' },
})
export class SbbContextMenu<T> {
  private readonly document = inject(DOCUMENT);

  /** The menu structure to show on right-click. */
  readonly model = input.required<SbbMenuItem<T>[]>();

  /** Contextual value passed to each chosen item's `onSelect`. */
  readonly data = input.required<T>();

  /** Fires with the contextual `data` when the menu opens (right-click). */
  readonly opened = output<T>();

  private readonly menu = viewChild.required<SbbMenu<T>>('menu');

  /**
   * Opens the menu at the pointer and announces the open.
   *
   * On some platforms (e.g. macOS) `contextmenu` fires while the triggering
   * button is still down, i.e. *before* the matching `pointerup`. The native
   * popover light-dismiss algorithm records `null` (no popover open) on that
   * `pointerdown`; if we open synchronously here, the still-pending
   * `pointerup` lands after the panel exists, and if it's outside the panel
   * it *also* resolves to `null` — the spec treats two `null`s as "same
   * target" and light-dismisses everything that's open, closing the menu we
   * just opened. Detected via `event.buttons`: if a button is still held, we
   * defer the open until that button's `pointerup` has been fully
   * dispatched (and thus its dismissal check already resolved against "no
   * popover open").
   */
  protected onContextMenu(event: MouseEvent): void {
    event.preventDefault();
    const point = { x: event.clientX, y: event.clientY };
    if (event.buttons !== 0) {
      const openOnce = (): void => {
        this.document.removeEventListener('pointerup', openOnce, true);
        this.menu().open(point);
        this.opened.emit(this.data());
      };
      this.document.addEventListener('pointerup', openOnce, true);
      return;
    }
    this.menu().open(point);
    this.opened.emit(this.data());
  }
}
