import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  model,
  output,
  untracked,
} from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { SBB_TABS_GROUP, SbbTabsGroupContract } from './tabs.token';
import { SbbTabPanel } from './tab-panel.component';

/** Emitted by `SbbTabs` after a drag-to-reorder gesture actually moves a tab. */
export interface SbbTabsReorderEvent {
  previousIndex: number;
  currentIndex: number;
}

let nextGroupId = 0;

/**
 * `SbbTabs` — a tab strip switching between projected `SbbTabPanel` content
 * regions.
 *
 * A new, from-scratch component — this codebase has no existing PrimeNG
 * `p-tabs`/`p-tabview` call site to migrate, so it's built directly to the
 * WAI-ARIA APG tabs pattern (https://www.w3.org/WAI/ARIA/apg/patterns/tabs/):
 *  - `value`       currently selected tab, two-way bindable (`[(value)]`);
 *                  defaults to the first non-disabled panel.
 *  - `orientation` `'horizontal'` (default, Left/Right arrow nav) or
 *                  `'vertical'` (Up/Down arrow nav).
 *  - Selecting a tab is "automatic activation": arrow-key navigation
 *    immediately selects the focused tab, matching the APG's recommended
 *    default and how most tab implementations behave.
 *
 * `<sbb-tab-panel value="..." label="...">` children are read via
 * `contentChildren` (the same approach `SbbSplitter` uses for
 * `SbbSplitterPanel`) to render the tablist strip here; each panel renders
 * only its own content region — see `SbbTabPanel` for why panels stay DOM
 * siblings rather than nested inside their tab button.
 *
 * A panel projecting an `<ng-template sbbTabHeader>` (see `SbbTabHeaderDef`)
 * gets rendered as a `role="tab"` `<div>` instead of a `<button>`, so its
 * header can hold other interactive elements (a close button, a link, an
 * inline-rename input) that a native `<button>` can't legally contain.
 *
 * Setting `reorderable` turns on drag-to-reorder of the tab strip itself
 * (Angular CDK drag-drop, kept behind this component per ADR-0006 — consumers
 * never import `@angular/cdk` directly). It only reorders the tab buttons;
 * reordering the underlying data is left to the `(reordered)` handler, since
 * `SbbTabs` doesn't own the panels' backing array.
 */
@Component({
  selector: 'sbb-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, CdkDropList, CdkDrag],
  template: `
    <div
      class="sbb-tabs__list"
      role="tablist"
      [attr.aria-orientation]="orientation()"
      cdkDropList
      [cdkDropListOrientation]="orientation()"
      [cdkDropListDisabled]="!reorderable()"
      (cdkDropListDropped)="onReordered($event)"
    >
      @for (panel of panels(); track panel) {
        @if (panel.headerTemplate(); as headerTemplate) {
          <!--
            Custom-header tabs carry the WAI-ARIA "tab" role on a dedicated,
            empty focus surface (.sbb-tabs__tab-focus) rather than on this
            wrapper. The wrapper is role="presentation" so the projected header
            — which legitimately holds its own interactive controls (close
            button, inline-rename input, links) — sits as a sibling of the tab
            rather than a focusable descendant of it, which the
            "nested-interactive" a11y rule forbids. Focus/keyboard live on the
            focus surface; the wrapper still owns click selection and drag.
          -->
          <div
            role="presentation"
            class="sbb-tabs__tab sbb-tabs__tab--custom"
            cdkDrag
            [cdkDragLockAxis]="dragLockAxis()"
            [cdkDragDisabled]="!reorderable() || panel.disabled() || panel.dragDisabled()"
            (click)="select(panel)"
            (keydown)="onKeydown($event, panel)"
          >
            <div
              role="tab"
              class="sbb-tabs__tab-focus"
              [id]="tabId(panel)"
              [attr.aria-label]="panel.label() || null"
              [attr.aria-selected]="panel.value() === value()"
              [attr.aria-controls]="panelId(panel)"
              [attr.aria-disabled]="panel.disabled() || null"
              [tabindex]="panel.value() === value() ? 0 : -1"
            ></div>
            <ng-container [ngTemplateOutlet]="headerTemplate" />
          </div>
        } @else {
          <button
            type="button"
            role="tab"
            class="sbb-tabs__tab"
            [id]="tabId(panel)"
            [attr.aria-selected]="panel.value() === value()"
            [attr.aria-controls]="panelId(panel)"
            [attr.aria-disabled]="panel.disabled() || null"
            [disabled]="panel.disabled()"
            [tabindex]="panel.value() === value() ? 0 : -1"
            cdkDrag
            [cdkDragLockAxis]="dragLockAxis()"
            [cdkDragDisabled]="!reorderable() || panel.disabled() || panel.dragDisabled()"
            (click)="select(panel)"
            (keydown)="onKeydown($event, panel)"
          >
            {{ panel.label() }}
          </button>
        }
      }
    </div>
    <ng-content />
  `,
  styleUrl: './tabs.component.scss',
  host: { class: 'sbb-tabs' },
  providers: [{ provide: SBB_TABS_GROUP, useExisting: SbbTabs }],
})
export class SbbTabs implements SbbTabsGroupContract {
  private readonly document = inject(DOCUMENT);

  readonly groupId = `sbb-tabs-${++nextGroupId}`;

  /** Orientation of the tab strip; also the arrow-key navigation axis. @default 'horizontal' */
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');

  /** Currently selected tab's `value`. Two-way bindable via `[(value)]`. */
  readonly value = model<string | undefined>(undefined);

  /** Enables drag-to-reorder of the tab strip. @default false */
  readonly reorderable = input(false);

  /** Emitted after a drag-to-reorder gesture moves a tab to a new index. */
  readonly reordered = output<SbbTabsReorderEvent>();

  readonly activeValue = this.value;

  protected readonly panels = contentChildren(SbbTabPanel);

  protected readonly dragLockAxis = computed(() => (this.orientation() === 'horizontal' ? 'x' : 'y'));

  constructor() {
    // Default to the first non-disabled panel once panels are registered, but
    // only if nothing (or a since-removed panel) is currently selected —
    // never clobber an explicit `[value]` the caller already set.
    effect(() => {
      const panels = this.panels();
      untracked(() => {
        try {
          if (!panels.some((panel) => panel.value() === this.value())) {
            this.value.set(panels.find((panel) => !panel.disabled())?.value());
          }
        } catch {
          // A panel registered by contentChildren() can momentarily lag its
          // own required `value` input — e.g. panels added/reordered via a
          // live `@for` (a `reorderable` strip backed by an array) — which
          // throws NG0950 on read. Skip this run; the effect reruns as soon
          // as `panels()` next changes, by which point inputs have settled.
        }
      });
    });
  }

  protected tabId(panel: SbbTabPanel): string {
    return `${this.groupId}-tab-${panel.value()}`;
  }

  protected panelId(panel: SbbTabPanel): string {
    return `${this.groupId}-panel-${panel.value()}`;
  }

  protected select(panel: SbbTabPanel): void {
    if (panel.disabled()) {
      return;
    }
    this.value.set(panel.value());
  }

  protected onReordered(event: CdkDragDrop<unknown>): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }
    this.reordered.emit({ previousIndex: event.previousIndex, currentIndex: event.currentIndex });
  }

  /** Roving arrow-key navigation between enabled tabs (Home/End jump to the ends). */
  protected onKeydown(event: KeyboardEvent, current: SbbTabPanel): void {
    const panels = this.panels().filter((panel) => !panel.disabled());
    if (panels.length === 0) {
      return;
    }
    const horizontal = this.orientation() === 'horizontal';
    const currentIndex = panels.indexOf(current);
    const forward = (currentIndex + 1 + panels.length) % panels.length;
    const backward = (currentIndex - 1 + panels.length) % panels.length;
    let nextIndex: number | undefined;
    switch (event.key) {
      case 'ArrowRight':
        nextIndex = horizontal ? forward : undefined;
        break;
      case 'ArrowLeft':
        nextIndex = horizontal ? backward : undefined;
        break;
      case 'ArrowDown':
        nextIndex = horizontal ? undefined : forward;
        break;
      case 'ArrowUp':
        nextIndex = horizontal ? undefined : backward;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = panels.length - 1;
        break;
      default:
        return;
    }
    if (nextIndex === undefined) {
      return;
    }
    event.preventDefault();
    const next = panels[nextIndex];
    this.value.set(next.value());
    this.document.getElementById(this.tabId(next))?.focus();
  }
}
