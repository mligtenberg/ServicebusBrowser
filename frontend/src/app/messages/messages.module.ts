import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { messagesReducer } from './ngrx/messages.reducers';
import { EffectsModule } from '@ngrx/effects';
import { MessagesEffects } from './messages.effects';
import { ViewMessagesComponent } from './view-messages/view-messages.component';
import { RouterModule, Routes } from '@angular/router';
import { GetMesagesDialogComponent } from './get-mesages-dialog/get-mesages-dialog.component';
import { FormsModule } from '@angular/forms';
import { QueueMessageComponent } from './queue-message/queue-message.component';
import { UiModule } from '../ui/ui.module';

const routes: Routes = [
  { path: 'view', component: ViewMessagesComponent },
  { path: 'queue', component: QueueMessageComponent }
];

@NgModule({
  declarations: [ViewMessagesComponent, GetMesagesDialogComponent, QueueMessageComponent],
  imports: [
    CommonModule,
    StoreModule.forFeature('messages', messagesReducer),
    EffectsModule.forFeature([MessagesEffects]),
    RouterModule.forChild(routes),
    FormsModule,
    UiModule
  ],
  exports: [
    GetMesagesDialogComponent
  ]
})
export class MessagesModule { }
