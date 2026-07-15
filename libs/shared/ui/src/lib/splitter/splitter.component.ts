import {
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { SbbSplitterLayout } from './splitter.models';
import { SBB_SPLITTER_GROUP } from './splitter.token';
import { SbbSplitterPanel } from './splitter-panel.component';

function eventPoint(event: MouseEvent | TouchEvent, horizontal: boolean): number {
  const point = event instanceof MouseEvent ? event : event.touches[0];
  return horizontal ? point.clientX : point.clientY;
}

/**
 * Clamps `left`/`right`'s shared boundary by `delta` (percentage points moved
 * from left to right), honoring each panel's `minSize`/`maxSize`. Returns
 * `null` if clamping would change their combined size (i.e. the drag/nudge
 * has run past what both panels can absorb together) rather than applying a
 * partial move.
 */
function resizedPair(
  sizes: readonly number[],
  index: number,
  delta: number,
  left: SbbSplitterPanel,
  right: SbbSplitterPanel,
): number[] | null {
  const newLeft = Math.max(left.minSize(), Math.min(left.maxSize(), sizes[index] + delta));
  const newRight = Math.max(
    right.minSize(),
    Math.min(right.maxSize(), sizes[index + 1] - delta),
  );
  if (Math.abs(newLeft + newRight - (sizes[index] + sizes[index + 1])) > 0.01) {
    return null;
  }
  const next = [...sizes];
  next[index] = newLeft;
  next[index + 1] = newRight;
  return next;
}

/**
 * `SbbSplitter` — a resizable split-pane container with a draggable gutter
 * between each projected `<sbb-splitter-panel>`.
 *
 * Opinionated-minimal public API (derived from current `p-splitter` usage,
 * e.g. `main-ui.html`, `messages-viewer.html`, `send-message.component.html`):
 *  - `orientation`          `'horizontal'` (default) or `'vertical'`.
 *  - `resizeStart` / `resizeEnd`  emitted around a drag gesture
 *    (was `onResizeStart` / `onResizeEnd`).
 *  - `panelSizesChange`     emits the current panel sizes (percentages)
 *    whenever they change, from dragging or from keyboard resizing
 *    (was `resize` / `onResizeEnd` combined into one signal-friendly output).
 *
 * Panels are plain `<sbb-splitter-panel [size]="...">` content, not a
 * `<ng-template #panel>` — matches how call sites already structure markup
 * for everything except PrimeNG's splitter today.
 *
 * Drag/keyboard resizing is implemented directly with pointer events and a
 * `layout` signal rather than a headless primitive: the group only ever
 * needs flexbox percentage math, no overlay/portal, so pulling in
 * `@spartan-ng/brain`'s `BrnResizableGroup`/`BrnResizablePanel` (or CDK's
 * `DragDrop`, built for absolute drag positions rather than
 * percentage-of-container splits) added a dependency for no benefit.
 */
@Component({
  selector: 'sbb-splitter',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styleUrl: './splitter.component.scss',
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
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  /** Layout axis of the splitter (`'horizontal'` default or `'vertical'`). */
  readonly orientation = input<SbbSplitterLayout>('horizontal');

  /** Emitted when a drag gesture on a gutter begins/ends (not fired for keyboard resizing). */
  readonly resizeStart = output<void>();
  readonly resizeEnd = output<void>();

  /** Emitted with the current panel sizes (percentages) whenever they change. */
  readonly panelSizesChange = output<number[]>();

  private readonly panels = contentChildren(SbbSplitterPanel);

  /** Current size (percentage) of each panel, indexed to match `panels()`. */
  private readonly layout = signal<number[]>([]);

  constructor() {
    // Re-baseline from each panel's `size` input whenever panel membership
    // changes (initial render, panels added/removed) — not on every CD cycle,
    // so an in-progress drag or keyboard nudge is never clobbered.
    effect(() => {
      const panels = this.panels();
      untracked(() => this.layout.set(panels.map((panel) => panel.size())));
    });
  }

  /** @internal Used by `SbbSplitterPanel` to decide whether to render a trailing handle. */
  hasHandleAfter(panel: SbbSplitterPanel): boolean {
    const panels = this.panels();
    const index = panels.indexOf(panel);
    return index >= 0 && index < panels.length - 1;
  }

  /** @internal Current size (percentage) of `panel`. */
  sizeFor(panel: SbbSplitterPanel): number {
    const index = this.panels().indexOf(panel);
    const layout = this.layout();
    return index >= 0 && index < layout.length ? layout[index] : panel.size();
  }

  /**
   * @internal Start a pointer drag on the gutter after `panel`, tracked with
   * plain `mousemove`/`touchmove`/`mouseup`/`touchend` listeners on
   * `document` (the drag can leave the handle's bounds).
   */
  startResizeFromPanel(panel: SbbSplitterPanel, event: MouseEvent | TouchEvent): void {
    const panels = this.panels();
    const index = panels.indexOf(panel);
    if (index < 0 || index >= panels.length - 1) {
      return;
    }
    event.preventDefault();
    this.startResize(index, event);
  }

  /** @internal Keyboard resize of the gutter after `panel` (signed percentage). */
  nudgeAfter(panel: SbbSplitterPanel, delta: number): void {
    const panels = this.panels();
    const index = panels.indexOf(panel);
    if (index < 0 || index >= panels.length - 1) {
      return;
    }
    const sizes = this.layout();
    if (sizes.length !== panels.length) {
      return;
    }
    const next = resizedPair(sizes, index, delta, panels[index], panels[index + 1]);
    if (!next) {
      return;
    }
    this.layout.set(next);
    this.panelSizesChange.emit(next);
  }

  private startResize(index: number, event: MouseEvent | TouchEvent): void {
    const panels = this.panels();
    const startSizes = this.layout();
    if (startSizes.length !== panels.length) {
      return;
    }
    const left = panels[index];
    const right = panels[index + 1];
    const horizontal = this.orientation() === 'horizontal';
    const axisSize = horizontal
      ? this.elementRef.nativeElement.offsetWidth
      : this.elementRef.nativeElement.offsetHeight;
    const startPoint = eventPoint(event, horizontal);

    document.body.style.cursor = horizontal ? 'ew-resize' : 'ns-resize';
    this.resizeStart.emit();

    const onMove = (moveEvent: MouseEvent | TouchEvent) => {
      const delta = ((eventPoint(moveEvent, horizontal) - startPoint) / axisSize) * 100;
      const next = resizedPair(startSizes, index, delta, left, right);
      if (next) {
        this.layout.set(next);
        this.panelSizesChange.emit(next);
      }
    };
    const onEnd = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchend', onEnd);
      document.removeEventListener('touchcancel', onEnd);
      document.body.style.cursor = 'default';
      this.resizeEnd.emit();
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove);
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchend', onEnd);
    document.addEventListener('touchcancel', onEnd);
  }
}
