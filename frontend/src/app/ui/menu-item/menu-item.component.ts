import { Component, ViewEncapsulation, ChangeDetectionStrategy, Input, Output, HostListener, ElementRef } from '@angular/core';

@Component({
  selector: 'app-menu-item',
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuItemComponent {
  @Input()
  @Output()
  public showSubmenu: boolean = false;
  @Input()
  public name: string = "";

  private lastInternalEvent: Event;

  @HostListener('document:click', ['$event'])
  clickout($event: Event) {
    if ($event === this.lastInternalEvent) {
      return;
    }
    this.showSubmenu = false;
  }

  public toggleShowSubMenu($event: Event): void {
    this.showSubmenu = !this.showSubmenu;
    this.lastInternalEvent = $event;
  }
}
