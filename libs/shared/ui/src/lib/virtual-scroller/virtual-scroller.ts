import { Component, input, contentChild, TemplateRef, ChangeDetectionStrategy } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'sbb-virtual-scroller',
  standalone: true,
  imports: [ScrollingModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <cdk-virtual-scroll-viewport [itemSize]="itemSize()" [appendOnly]="appendOnly()" class="sbb-virtual-scroll-viewport">
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
}
