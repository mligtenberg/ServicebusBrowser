import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { messagesReducer } from './ngrx/messages.reducers';
import { EffectsModule } from '@ngrx/effects';
import { MessagesEffects } from './messages.effects';
import { ViewMessagesComponent } from './view-messages/view-messages.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'view', component: ViewMessagesComponent }
];

@NgModule({
  declarations: [ViewMessagesComponent],
  imports: [
    CommonModule,
    StoreModule.forFeature('messages', messagesReducer),
    EffectsModule.forFeature([MessagesEffects]),
    RouterModule.forChild(routes)
  ]
})
export class MessagesModule { }
