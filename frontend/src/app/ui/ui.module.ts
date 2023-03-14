import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItemComponent } from './menu-item/menu-item.component';
import { SubmenuItemComponent } from './submenu-item/submenu-item.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ConsoleComponent } from './console/console.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ToggleBoxComponent } from './toggle-box/toggle-box.component';
import { ContextmenuComponent } from './contextmenu/contextmenu.component';
import { ContextmenuItemComponent } from './contextmenu-item/contextmenu-item.component';
import { ResizableModule } from 'angular-resizable-element';
import { RefreshButtonComponent } from './refresh-button/refresh-button.component';
import { DurationInputComponent } from './duration-input/duration-input.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ContextmenuDividerComponent } from './contextmenu-divider/contextmenu-divider.component';
import { MessagebarComponent } from './messagebar/messagebar.component';
import { TextboxInputDialogComponent } from './textbox-input-dialog/textbox-input-dialog.component';
import { TextboxDialogInputComponent } from './textbox-dialog-input/textbox-dialog-input.component';
import { FirstLinePipe } from './pipes/first-line.pipe';
import { TabBarComponent } from './tab-bar/tab-bar.component';
import { RouterModule } from '@angular/router';
import { TasksListComponent } from './tasks-list/tasks-list.component';
import { NuMonacoEditorModule } from '@ng-util/monaco-editor';
import { ConfirmDialogBodyComponent } from './confirm-dialog-body/confirm-dialog-body.component';
import { MenubarComponent } from './menubar/menubar.component';
import { DialogContainerComponent } from './dialogs/dialog-container/dialog-container.component';
import { DialogModule } from '@angular/cdk/dialog';

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
        RefreshButtonComponent,
        DurationInputComponent,
        ContextmenuDividerComponent,
        MessagebarComponent,
        TextboxInputDialogComponent,
        TextboxDialogInputComponent,
        FirstLinePipe,
        TabBarComponent,
        TasksListComponent,
        ConfirmDialogBodyComponent,
        DialogContainerComponent,
    ],
    imports: [
        CommonModule,
        FontAwesomeModule,
        ResizableModule,
        FormsModule,
        ReactiveFormsModule,
        NuMonacoEditorModule,
        RouterModule,
        DialogModule,
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
        TextboxDialogInputComponent,
        TabBarComponent,
        TasksListComponent,
    ],
})
export class UiModule {}
