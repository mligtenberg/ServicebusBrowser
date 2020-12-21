import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenubarComponent } from './menubar/menubar.component';
import { MenuItemComponent } from './menu-item/menu-item.component';
import { SubmenuItemComponent } from './submenu-item/submenu-item.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ConsoleComponent } from './console/console.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [
    MenubarComponent,
    MenuItemComponent,
    SubmenuItemComponent,
    SidebarComponent,
    ConsoleComponent
  ],
  imports: [
    CommonModule,
    FontAwesomeModule
  ],
  exports: [
    MenubarComponent,
    MenuItemComponent,
    SubmenuItemComponent,
    SidebarComponent,
    ConsoleComponent,
  ]
})
export class UiModule { }
