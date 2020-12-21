import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { IConnectionsState } from './connections/ngrx/connections.reducers';
import { ILoggingState } from './logging/ngrx/logging.reducers';

export interface State {
  connections: IConnectionsState;
  logging: ILoggingState;
}

@NgModule({
  declarations: [],
  imports: [
    StoreModule.forRoot({})
  ]
})
export class NgrxModule { }
