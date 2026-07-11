import {
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  inject,
  output,
} from '@angular/core';
import { BrnResizableGroup } from '@spartan-ng/brain/resizable';
import { SBB_SPLITTER_GROUP } from './splitter.token';
import { SbbSplitterPanel } from './splitter-panel.component';

/**
 * `SbbSplitter` — a resizable split-pane container with a draggable gutter
 * between each projected `<sbb-splitter-panel>`.
 *
 * Opinionated-minimal public API (derived from current `p-splitter` usage,
 * e.g. `main-ui.html`, `messages-viewer.html`, `send-message.component.html`):
 *  - `layout`               `'horizontal'` (default) or `'vertical'`.
 *  - `resizeStart` / `resizeEnd`  emitted around a drag gesture
 *    (was `onResizeStart` / `onResizeEnd`).
 *  - `panelSizesChange`     emits the current panel sizes (percentages)
 *    whenever they change, from dragging or from keyboard resizing
 *    (was `resize` / `onResizeEnd` combined into one signal-friendly output).
 *
 * Panels are plain `<sbb-splitter-panel [size]="...">` content, not a
 * `<ng-template #panel>` — matches how call sites already structure markup
 * for everything except PrimeNG's splitter today.
 */
@Component({
  selector: 'sbb-splitter',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styleUrl: './splitter.component.scss',
  hostDirectives: [
    {
      directive: BrnResizableGroup,
      inputs: ['direction: orientation'],
      outputs: ['dragStart: resizeStart', 'dragEnd: resizeEnd'],
    },
  ],
  host: {
    class: 'sbb-splitter',
    '[attr.data-layout]': 'orientation()',
  },
  providers: [
    {
      provide: SBB_SPLITTER_GROUP,
      useExisting: SbbSplitter,
    },
  ],
})
export class SbbSplitter {
  private readonly hostGroup = inject(BrnResizableGroup, { self: true });

  /**
   * Layout axis of the splitter (`'horizontal'` default or `'vertical'`),
   * bound via the `BrnResizableGroup.direction` host-directive input aliased to
   * `orientation` (the primitive reserves the name `layout` for panel sizes).
   * Exposed here (readable) for the host `data-layout` binding and for child
   * panels via {@link SBB_SPLITTER_GROUP}.
   */
  readonly orientation = this.hostGroup.direction;

  /** Emitted with the current panel sizes (percentages) whenever they change. */
  readonly panelSizesChange = output<number[]>();

  private readonly panels = contentChildren(SbbSplitterPanel);

  constructor() {
    this.hostGroup.layoutChanged.subscribe((sizes: number[]) =>
      this.panelSizesChange.emit(sizes),
    );
  }

  /** @internal Used by `SbbSplitterPanel` to decide whether to render a trailing handle. */
  hasHandleAfter(panel: SbbSplitterPanel): boolean {
    const panels = this.panels();
    const index = panels.indexOf(panel);
    return index >= 0 && index < panels.length - 1;
  }

  /**
   * @internal Start a pointer drag on the gutter after `panel`. Bypasses the
   * primitive `BrnResizableHandle` (whose DOM-sibling index walk assumes the
   * handle is a flat sibling of the panels, which our handle-inside-panel markup
   * violates) and drives `BrnResizableGroup.startResize` with the index we
   * already track via `contentChildren`.
   */
  startResizeFromPanel(panel: SbbSplitterPanel, event: MouseEvent | TouchEvent): void {
    const index = this.panels().indexOf(panel);
    if (index < 0 || index >= this.panels().length - 1) {
      return;
    }
    event.preventDefault();
    this.hostGroup.startResize(index, event);
  }

  /** @internal Keyboard resize of the gutter after `panel` (signed percentage). */
  nudgeAfter(panel: SbbSplitterPanel, delta: number): void {
    const panels = this.panels();
    const index = panels.indexOf(panel);
    if (index < 0 || index >= panels.length - 1) {
      return;
    }
    const left = panels[index];
    const right = panels[index + 1];
    const sizes = [...this.hostGroup.layout()];
    if (sizes.length !== panels.length) {
      return;
    }
    const newLeft = Math.max(
      left.hostPanel.minSize(),
      Math.min(left.hostPanel.maxSize(), sizes[index] + delta),
    );
    const newRight = Math.max(
      right.hostPanel.minSize(),
      Math.min(right.hostPanel.maxSize(), sizes[index + 1] - delta),
    );
    if (Math.abs(newLeft + newRight - (sizes[index] + sizes[index + 1])) > 0.01) {
      return;
    }
    sizes[index] = newLeft;
    sizes[index + 1] = newRight;
    this.hostGroup.layout.set(sizes);
    this.hostGroup.updatePanelStyles();
  }
}
