import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { IConnectionsState } from './connections/ngrx/connections.reducers';
import { ILoggingState } from './logging/ngrx/logging.reducers';
import { IMessagesState } from './messages/ngrx/messages.reducers';
import { IQueuesState } from './queues/ngrx/queues.reducers';
import { ITopicsState } from './topics/ngrx/topics.reducers';

export interface State {
  logging: ILoggingState;
  connections: IConnectionsState;
  queues: IQueuesState;
  topics: ITopicsState;
  messages: IMessagesState;
}

@NgModule({
  declarations: [],
  imports: [
    StoreModule.forRoot({})
  ]
})
export class NgrxModule { }
