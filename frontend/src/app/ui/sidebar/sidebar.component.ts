import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ResizeEvent } from 'angular-resizable-element';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  minWidth: number = 100;
  width: number = 300;

  onResizeEnd($event: ResizeEvent): void {
    this.width = this.minWidth < $event.rectangle.width ? $event.rectangle.width : this.minWidth;
  }
}
