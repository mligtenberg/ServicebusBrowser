import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { BrnResizableHandle, BrnResizablePanel } from '@spartan-ng/brain/resizable';
import { SBB_SPLITTER_GROUP } from './splitter.token';

/**
 * `SbbSplitterPanel` — one resizable pane inside an `SbbSplitter`.
 *
 * Opinionated-minimal public API (derived from current `p-splitter` /
 * `<ng-template #panel>` usage): a panel is just a sized content region.
 * `size` maps to `p-splitter`'s `panelSizes` entry for this pane (percentage
 * of the splitter's main axis). `minSize`/`maxSize` bound how far the panel
 * can be dragged. Content is projected as-is, no `<ng-template>` indirection.
 *
 * Each panel (except the last) renders the draggable gutter after itself, so
 * consumers never place a separate handle element between panels.
 */
@Component({
  selector: 'sbb-splitter-panel',
  imports: [BrnResizableHandle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-content />
    @if (showHandle()) {
      <div
        brnResizableHandle
        withHandle
        class="sbb-splitter-panel__handle"
        [attr.data-layout]="orientation()"
      ></div>
    }
  `,
  styleUrl: './splitter-panel.component.scss',
  hostDirectives: [
    {
      directive: BrnResizablePanel,
      inputs: ['defaultSize: size', 'minSize', 'maxSize', 'collapsible'],
    },
  ],
  host: {
    class: 'sbb-splitter-panel',
  },
})
export class SbbSplitterPanel {
  private readonly group = inject(SBB_SPLITTER_GROUP);

  /**
   * @internal Used by `SbbSplitter` to compute handle placement, and the
   * backing directive for this panel's public `size`/`minSize`/`maxSize`/
   * `collapsible` inputs (aliased from `BrnResizablePanel` via `hostDirectives`).
   */
  readonly hostPanel = inject(BrnResizablePanel, { self: true });

  protected readonly orientation = this.group.orientation;

  /** Renders the gutter handle right after this panel, unless it is the last one. */
  protected readonly showHandle = computed(() =>
    this.group.hasHandleAfter(this),
  );
}
