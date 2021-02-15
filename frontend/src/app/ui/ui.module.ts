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
import { DurationInputComponent } from './duration-input/duration-input.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ContextmenuDividerComponent } from './contextmenu-divider/contextmenu-divider.component';
import { MessagebarComponent } from './messagebar/messagebar.component';
import { TextboxInputDialogComponent } from './textbox-input-dialog/textbox-input-dialog.component';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { TextboxDialogInputComponent } from './textbox-dialog-input/textbox-dialog-input.component';
import { FirstLinePipe } from './pipes/first-line.pipe';

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
    DurationInputComponent,
    ContextmenuDividerComponent,
    MessagebarComponent,
    TextboxInputDialogComponent,
    TextboxDialogInputComponent,
    FirstLinePipe
  ],
  imports: [
    CommonModule,
    FontAwesomeModule,
    ResizableModule,
    FormsModule,
    ReactiveFormsModule,
    MonacoEditorModule
  ],
  exports: [
    MenubarComponent,
    MenuItemComponent,
    SubmenuItemComponent,
    SidebarComponent,
    ConsoleComponent,
    ToggleBoxComponent,
    ContextmenuItemComponent,
    RefreshButtonComponent,
    DurationInputComponent,
    ContextmenuDividerComponent,
    TextboxDialogInputComponent
  ]
})
export class UiModule { }
