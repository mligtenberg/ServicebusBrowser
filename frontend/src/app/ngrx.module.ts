import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { IConnectionsState } from './connections/ngrx/connections.reducers';
import { ILoggingState } from './logging/ngrx/logging.reducers';
import { IQueuesState } from './queues/ngrx/queues.reducers';

export interface State {
  logging: ILoggingState;
  connections: IConnectionsState;
  queues: IQueuesState;
}

@NgModule({
  declarations: [],
  imports: [
    StoreModule.forRoot({})
  ]
})
export class NgrxModule { }
