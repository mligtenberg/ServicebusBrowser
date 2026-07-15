import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
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
 *
 * Sizing is `flex: {size} 1 0` (grow ratio, basis 0) rather than
 * `flex-basis: {size}%`, so panels distribute space proportionally to their
 * current size.
 */
@Component({
  selector: 'sbb-splitter-panel',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-content />
    @if (showHandle()) {
      <div
        class="sbb-splitter-panel__handle"
        role="separator"
        tabindex="0"
        [attr.data-layout]="orientation()"
        [attr.aria-orientation]="
          orientation() === 'vertical' ? 'horizontal' : 'vertical'
        "
        (mousedown)="onHandlePointerDown($event)"
        (touchstart)="onHandlePointerDown($event)"
        (keydown)="onHandleKeydown($event)"
      ></div>
    }
  `,
  styleUrl: './splitter-panel.component.scss',
  host: {
    class: 'sbb-splitter-panel',
    '[attr.data-layout]': 'orientation()',
    '[attr.data-panel-size]': 'currentSize()',
    '[style.flex]': 'flex()',
  },
})
export class SbbSplitterPanel {
  private readonly group = inject(SBB_SPLITTER_GROUP);

  /** Initial size (percentage of the splitter's main axis). */
  readonly size = input<number>(0);
  /** Minimum size (percentage) this panel can be dragged/nudged to. */
  readonly minSize = input<number>(0);
  /** Maximum size (percentage) this panel can be dragged/nudged to. */
  readonly maxSize = input<number>(100);

  protected readonly orientation = this.group.orientation;

  /** Current size (percentage), reactive to drag/keyboard resizing. */
  protected readonly currentSize = computed(() => this.group.sizeFor(this));

  protected readonly flex = computed(() => `${this.currentSize()} 1 0`);

  /** Renders the gutter handle right after this panel, unless it is the last one. */
  protected readonly showHandle = computed(() => this.group.hasHandleAfter(this));

  /** Start a drag when the gutter after this panel is pressed. */
  protected onHandlePointerDown(event: MouseEvent | TouchEvent): void {
    this.group.startResizeFromPanel(this, event);
  }

  /** Keyboard resize of the gutter after this panel (arrow keys, shift = coarse). */
  protected onHandleKeydown(event: KeyboardEvent): void {
    const step = event.shiftKey ? 10 : 1;
    const horizontal = this.orientation() === 'horizontal';
    let delta = 0;
    switch (event.key) {
      case 'ArrowLeft':
        if (horizontal) delta = -step;
        break;
      case 'ArrowRight':
        if (horizontal) delta = step;
        break;
      case 'ArrowUp':
        if (!horizontal) delta = -step;
        break;
      case 'ArrowDown':
        if (!horizontal) delta = step;
        break;
      default:
        return;
    }
    if (delta !== 0) {
      event.preventDefault();
      this.group.nudgeAfter(this, delta);
    }
  }
}
