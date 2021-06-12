import { NgModule } from '@angular/core';
import { routerReducer, RouterReducerState } from '@ngrx/router-store';
import { StoreModule } from '@ngrx/store';
import { IConnectionsState } from './connections/ngrx/connections.reducers';
import { ILoggingState } from './logging/ngrx/logging.reducers';
import { IMessagesState } from './messages/ngrx/messages.reducers';
import { IQueuesState } from './queues/ngrx/queues.reducers';
import { ITopicsState } from './topics/ngrx/topics.reducers';
import {globalStateReducer, IGlobalState} from './ngrx/reducer';
import {EffectsModule} from '@ngrx/effects';
import {GlobalStateEffects} from './global-state.effects';

export interface State {
  logging: ILoggingState;
  connections: IConnectionsState;
  queues: IQueuesState;
  topics: ITopicsState;
  messages: IMessagesState;
  router: RouterReducerState<any>;
  global: IGlobalState;
}

@NgModule({
  declarations: [],
  imports: [
    StoreModule.forRoot({
      router: routerReducer,
      global: globalStateReducer,
    }),
    EffectsModule.forFeature([GlobalStateEffects])
  ]
})
export class NgrxModule { }
