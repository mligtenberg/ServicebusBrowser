import { ChangeDetectionStrategy, Component, computed, contentChild, inject, input } from '@angular/core';
import { SBB_TABS_GROUP } from './tabs.token';
import { SbbTabHeaderDef } from './tab-header.directive';

/**
 * `SbbTabPanel` — one tab's content region inside an `SbbTabs` group.
 *
 * A new, from-scratch component — this codebase has no existing PrimeNG
 * `p-tabs`/`p-tabview` call site to migrate, so the public API is kept
 * intentionally minimal rather than mirroring a specific prior usage:
 *  - `value`    identifies the tab; matches `SbbTabs`'s `value`.
 *  - `label`    plain-text caption shown in the tab strip.
 *  - `disabled` prevents this tab from being selected.
 *
 * For richer tab headers (icons, a close button, inline rename), project an
 * `<ng-template sbbTabHeader>` — see `SbbTabHeaderDef`. `label` is still used
 * for `aria-label` fallback text in that case, so keep it set even when the
 * template supplies the visible content.
 *
 * `SbbTabs` renders the tablist strip itself (reading `label()`/`disabled()`
 * off each registered panel via `contentChildren`, the same approach as
 * `SbbSplitter`/`SbbSplitterPanel`); this component renders only its own
 * `role="tabpanel"` region, kept as a DOM sibling of the other panels rather
 * than nested inside a tab button — the WAI-ARIA APG tabs pattern
 * (https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) expects a tablist of tab
 * buttons and a separate set of tabpanels. Coordinated through a small
 * `SbbTabsGroupContract` DI token; no CDK overlay/a11y primitive is needed
 * for this interaction pattern.
 */
@Component({
  selector: 'sbb-tab-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="sbb-tab-panel"
      role="tabpanel"
      [id]="panelId()"
      [attr.aria-labelledby]="tabId()"
      [hidden]="!isActive()"
      tabindex="0"
    >
      <ng-content />
    </div>
  `,
  styleUrl: './tab-panel.component.scss',
})
export class SbbTabPanel {
  private readonly group = inject(SBB_TABS_GROUP);

  /** Identifies this tab; matches `SbbTabs`'s `value`. */
  readonly value = input.required<string>();

  /** Plain-text caption shown in the tab strip. */
  readonly label = input('');

  /** Prevents this tab from being selected. @default false */
  readonly disabled = input(false);

  /**
   * Suppresses drag-to-reorder for just this tab while `reorderable` is on
   * (e.g. while its header is mid inline-rename) without affecting whether
   * it can still be selected. @default false
   */
  readonly dragDisabled = input(false);

  private readonly headerDef = contentChild(SbbTabHeaderDef);

  /** Custom tab-header template, if an `<ng-template sbbTabHeader>` was projected. */
  readonly headerTemplate = computed(() => this.headerDef()?.template);

  protected readonly tabId = computed(() => `${this.group.groupId}-tab-${this.value()}`);
  protected readonly panelId = computed(() => `${this.group.groupId}-panel-${this.value()}`);
  protected readonly isActive = computed(() => this.group.activeValue() === this.value());
}
