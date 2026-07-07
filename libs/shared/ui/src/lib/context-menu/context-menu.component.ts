import {
  CdkContextMenuTrigger,
  CdkMenu,
  CdkMenuItem,
  CdkMenuTrigger,
} from '@angular/cdk/menu';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  isSbbMenuSeparator,
  SbbMenuItem,
  SbbMenuSeparator,
} from '../menu';

/**
 * `SbbContextMenu` — wraps arbitrary content and shows a right-click context
 * menu built from an `SbbMenuItem` model, invoking each item's `onSelect`
 * with the bound contextual `data`.
 *
 * Opinionated-minimal replacement for the previous PrimeNG `p-contextMenu`
 * wrapper (`libs/shared/components/.../context-menu`). Instead of that
 * wrapper's imperative `target` element input, this uses CDK Menu's
 * declarative trigger idiom — wrap the trigger content in the component:
 *
 * ```html
 * <sbb-context-menu [model]="nodeMenu" [data]="node">
 *   <span>{{ node.name }}</span>
 * </sbb-context-menu>
 * ```
 *
 * Built on `@angular/cdk/menu` (`CdkContextMenuTrigger` + `CdkMenu`), which
 * supplies keyboard navigation, focus management, submenu positioning and
 * ARIA roles. brain ships no menu primitive in the installed version, so per
 * the sourcing rule this falls back to CDK. Nested `items` render as
 * submenus via a self-recursive menu template.
 *
 * The trigger host uses `display: contents` so it does not perturb the
 * projected content's layout.
 */
@Component({
  selector: 'sbb-context-menu',
  standalone: true,
  imports: [CdkContextMenuTrigger, CdkMenu, CdkMenuItem, CdkMenuTrigger],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './context-menu.component.html',
  styleUrl: './context-menu.component.scss',
  host: { class: 'sbb-context-menu-host' },
})
export class SbbContextMenu<T> {
  /** The menu structure to show on right-click. */
  readonly model = input.required<SbbMenuItem<T>[]>();

  /** Contextual value passed to each chosen item's `onSelect`. */
  readonly data = input.required<T>();

  /** Template type guard so the recursive template can branch on separators. */
  protected isSeparator(item: SbbMenuItem<T>): item is SbbMenuSeparator {
    return isSbbMenuSeparator(item);
  }

  /** Invokes the chosen item's `onSelect` with the current contextual data. */
  protected invoke(item: SbbMenuItem<T>): void {
    if (isSbbMenuSeparator(item)) {
      return;
    }
    item.onSelect?.(this.data());
  }
}
