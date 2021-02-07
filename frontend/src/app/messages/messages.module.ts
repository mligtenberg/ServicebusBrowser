import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { messagesReducer } from './ngrx/messages.reducers';
import { EffectsModule } from '@ngrx/effects';
import { MessagesEffects } from './messages.effects';
import { ViewMessagesComponent } from './view-messages/view-messages.component';
import { RouterModule, Routes } from '@angular/router';
import { GetMesagesDialogComponent } from './get-mesages-dialog/get-mesages-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QueueMessageComponent } from './queue-message/queue-message.component';
import { UiModule } from '../ui/ui.module';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { SelectMessageTargetDialogComponent } from './select-message-target-dialog/select-message-target-dialog.component';
import { ConnectionsModule } from '../connections/connections.module';

const routes: Routes = [
  { path: 'view', component: ViewMessagesComponent },
  { path: 'queue', component: QueueMessageComponent }
];

@NgModule({
  declarations: [ViewMessagesComponent, GetMesagesDialogComponent, QueueMessageComponent, SelectMessageTargetDialogComponent],
  imports: [
    CommonModule,
    StoreModule.forFeature('messages', messagesReducer),
    EffectsModule.forFeature([MessagesEffects]),
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    UiModule,
    MonacoEditorModule,
    ConnectionsModule
  ],
  exports: [
    GetMesagesDialogComponent
  ]
})
export class MessagesModule { }
