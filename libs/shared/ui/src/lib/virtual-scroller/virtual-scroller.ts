import { Component, input, contentChild, TemplateRef, ChangeDetectionStrategy, viewChild } from '@angular/core';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { syncViewportSize } from './viewport-size-sync';

@Component({
  selector: 'sbb-virtual-scroller',
  standalone: true,
  imports: [ScrollingModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <cdk-virtual-scroll-viewport tabindex="0" [itemSize]="itemSize()" [appendOnly]="appendOnly()" class="sbb-virtual-scroll-viewport">
      <ng-container *cdkVirtualFor="let item of items(); let i = index">
        <ng-container *ngTemplateOutlet="itemTemplate() || defaultTemplate; context: { $implicit: item, index: i }"></ng-container>
      </ng-container>
    </cdk-virtual-scroll-viewport>
    <ng-template #defaultTemplate></ng-template>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
      width: 100%;
    }
    .sbb-virtual-scroll-viewport {
      height: 100%;
      width: 100%;
    }
  `
})
export class SbbVirtualScroller<T> {
  items = input.required<T[]>();
  itemSize = input.required<number>();
  appendOnly = input<boolean>(false);
  
  itemTemplate = contentChild(TemplateRef);

  private viewport = viewChild(CdkVirtualScrollViewport);

  constructor() {
    // Host containers resize without a window resize (splitter drags,
    // collapsing panes), which CDK does not notice on its own.
    syncViewportSize(this.viewport);
  }
}
