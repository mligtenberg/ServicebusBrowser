import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenubarComponent } from './menubar/menubar.component';
import { MenuItemComponent } from './menu-item/menu-item.component';
import { SubmenuItemComponent } from './submenu-item/submenu-item.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ConsoleComponent } from './console/console.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ToggleBoxComponent } from './toggle-box/toggle-box.component';
import { ContextmenuComponent } from './contextmenu/contextmenu.component';
import { ContextmenuItemComponent } from './contextmenu-item/contextmenu-item.component';
import { DialogComponent } from './dialog/dialog.component';
import { ResizableModule } from 'angular-resizable-element';
import { RefreshButtonComponent } from './refresh-button/refresh-button.component';

@NgModule({
  declarations: [
    MenubarComponent,
    MenuItemComponent,
    SubmenuItemComponent,
    SidebarComponent,
    ConsoleComponent,
    ToggleBoxComponent,
    ContextmenuComponent,
    ContextmenuItemComponent,
    DialogComponent,
    RefreshButtonComponent,
  ],
  imports: [
    CommonModule,
    FontAwesomeModule,
    ResizableModule
  ],
  exports: [
    MenubarComponent,
    MenuItemComponent,
    SubmenuItemComponent,
    SidebarComponent,
    ConsoleComponent,
    ToggleBoxComponent,
    ContextmenuItemComponent,
    RefreshButtonComponent
  ]
})
export class UiModule { }
