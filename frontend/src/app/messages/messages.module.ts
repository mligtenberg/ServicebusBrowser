import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { messagesReducer } from './ngrx/messages.reducers';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StoreModule.forFeature('messages', messagesReducer)
  ]
})
export class MessagesModule { }
