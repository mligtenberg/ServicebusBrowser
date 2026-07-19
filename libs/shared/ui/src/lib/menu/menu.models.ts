/**
 * `SbbMenuItem` — a single entry in a context menu, dropdown menu or menubar.
 *
 * Opinionated-minimal replacement for `/api` `MenuItem`,
 * distilled from the fields actually used across the current call sites
 * (topology tree node menu, page-navigator tab menu, message grid menus):
 * `label`, `icon`, `disabled`, `separator`, nested `items`, plus the
 * repo-local `onSelect`/`supportedMultiSelection` convention carried over
 * from the previous `@service-bus-browser/shared-contracts` `SbbMenuItem`.
 *
 * CDK/menu-item types are NOT referenced here — this is the
 * canonical, framework-agnostic model that `SbbContextMenu` (and later the
 * menu/menubar wrappers) consume. `T` is the type of the contextual data the
 * menu operates on (e.g. a tree node or a grid row).
 *
 * The union discriminates on `supportedMultiSelection` so `onSelect` receives
 * a single `T` for single-selection items and `T | T[]` for items that opt
 * into acting on a multi-selection — matching the previous contract's typing.
 */
import { TemplateRef } from '@angular/core';

/**
 * Template context available to a `panelTemplate`. `close` collapses the
 * surrounding menu — custom panel content can't use `cdkMenuItem` to close
 * itself the way plain items do, because the template is declared outside
 * `SbbMenubar`'s own component tree: the embedded view's injector is rooted
 * where the `<ng-template>` was *declared*, not where CDK physically inserts
 * it, so `CdkMenuItem`'s constructor can't find the ambient `cdk-menu-stack`
 * token there (NG0201). Calling `close()` sidesteps DI entirely.
 */
export interface SbbMenuPanelContext {
  close(): void;
}

export type SbbMenuItem<T = unknown> =
  | SbbMenuActionItem<T>
  | SbbMenuMultiActionItem<T>
  | SbbMenuSeparator;

/** A menu entry that acts on a single contextual value. */
export interface SbbMenuActionItem<T> {
  /** Visible text of the entry. Can be a signal/function for dynamic updates. */
  label?: string | (() => string);
  /** Optional leading icon. Can be a signal/function for dynamic updates. */
  icon?: string | (() => string);
  /** When `true`, the entry cannot be invoked. Can be a signal/function. */
  disabled?: boolean | (() => boolean);
  /** Optional CSS class. Can be a signal/function for dynamic updates. */
  styleClass?: string | (() => string);
  separator?: boolean;
  supportedMultiSelection?: false;
  /** Invoked with the menu's contextual data when the entry is chosen. */
  onSelect?(data: T): void;
  /** command callback. */
  command?(event: any): void;
  /** Nested submenu entries. When present, the entry expands rather than acts. */
  items?: SbbMenuItem<T>[];
  /** Custom trigger content, replacing the default icon+label rendering. */
  triggerTemplate?: TemplateRef<void>;
  /** Custom panel content, replacing the default flat items list. */
  panelTemplate?: TemplateRef<SbbMenuPanelContext>;
}

/** A menu entry that can act on either a single value or a multi-selection. */
export interface SbbMenuMultiActionItem<T> {
  label?: string | (() => string);
  icon?: string | (() => string);
  disabled?: boolean | (() => boolean);
  styleClass?: string | (() => string);
  separator?: boolean;
  supportedMultiSelection?: true;
  onSelect?(data: T | T[]): void;
  /** command callback. */
  command?(event: any): void;
  items?: SbbMenuItem<T>[];
  /** Custom trigger content, replacing the default icon+label rendering. */
  triggerTemplate?: TemplateRef<void>;
  /** Custom panel content, replacing the default flat items list. */
  panelTemplate?: TemplateRef<SbbMenuPanelContext>;
}

/** A non-interactive horizontal rule separating groups of entries. */
export interface SbbMenuSeparator {
  separator: true;
}

/** Narrows an `SbbMenuItem` to the separator variant. */
export function isSbbMenuSeparator<T>(
  item: SbbMenuItem<T>,
): item is SbbMenuSeparator {
  return (item as SbbMenuSeparator).separator === true;
}
