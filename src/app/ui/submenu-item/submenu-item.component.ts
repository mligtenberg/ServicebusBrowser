import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-submenu-item',
  templateUrl: './submenu-item.component.html',
  styleUrls: ['./submenu-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubmenuItemComponent {

  @Input()
  public name: string = "";
}
