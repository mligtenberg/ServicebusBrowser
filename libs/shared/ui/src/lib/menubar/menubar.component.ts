import {
  CdkMenu,
  CdkMenuBar,
  CdkMenuItem,
  CdkMenuTrigger,
} from '@angular/cdk/menu';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { isSbbMenuSeparator, SbbMenuItem, SbbMenuSeparator } from '../menu';

/**
 * `SbbMenubar` — a horizontal application menu bar built from an `SbbMenuItem`
 * model. Top-level entries with nested `items` open submenus; leaf entries
 * invoke their `onSelect`.
 *
 * Opinionated-minimal replacement for PrimeNG's `<p-menubar>`. Built on
 * `@angular/cdk/menu` (`CdkMenuBar` + `CdkMenuTrigger`/`CdkMenu`), reusing the
 * same recursive submenu panel as `SbbContextMenu`/`SbbMenu`. The two custom
 * slots the current call site fills with `#start`/`#end` templates are exposed
 * as content-projection slots:
 *
 * ```html
 * <sbb-menubar [model]="menuItems()">
 *   <div sbbMenubarStart>…</div>
 *   <div sbbMenubarEnd>…</div>
 * </sbb-menubar>
 * ```
 *
 * CDK types never surface in the public API.
 */
@Component({
  selector: 'sbb-menubar',
  standalone: true,
  imports: [CdkMenuBar, CdkMenu, CdkMenuItem, CdkMenuTrigger],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './menubar.component.html',
  styleUrl: './menubar.component.scss',
  host: { class: 'sbb-menubar-host' },
})
export class SbbMenubar<T = void> {
  /** The menu structure to render across the bar. */
  readonly model = input.required<SbbMenuItem<T>[]>();

  /** Contextual value passed to each chosen item's `onSelect`. */
  readonly data = input<T>();

  /** Template type guard so the recursive template can branch on separators. */
  protected isSeparator(item: SbbMenuItem<T>): item is SbbMenuSeparator {
    return isSbbMenuSeparator(item);
  }

  /** Invokes the chosen item's `onSelect` or `command` with the contextual data. */
  protected invoke(item: SbbMenuItem<T>): void {
    if (isSbbMenuSeparator(item)) {
      return;
    }
    item.onSelect?.(this.data() as T);
    if ('command' in item && typeof item.command === 'function') {
      item.command({ item });
    }
  }

  /** Resolves value that can be either a plain type or a signal/function. */
  protected resolve<V>(value: V | (() => V) | undefined): V | undefined {
    if (typeof value === 'function') {
      return (value as () => V)();
    }
    return value;
  }
}
