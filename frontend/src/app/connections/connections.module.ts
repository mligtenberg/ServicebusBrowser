import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConnectionsRoutingModule } from './connections-routing.module';
import { EditComponent } from './edit/edit.component';
import { ConnectionPlaneComponent } from './connection-plane/connection-plane.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ConnectionPlaneItemComponent } from './connection-plane-item/connection-plane-item.component';
import { EffectsModule } from '@ngrx/effects';
import { ConnectionEffects } from './connection.effects';
import { connectionReducer } from './ngrx/connections.reducers';
import { StoreModule } from '@ngrx/store';
import { LoggingModule } from '../logging/logging.module';
import { QueuesModule } from '../queues/queues.module';
import { UiModule } from '../ui/ui.module';

@NgModule({
  declarations: [
    EditComponent,
    ConnectionPlaneComponent,
    ConnectionPlaneItemComponent
  ],
  imports: [
    CommonModule,
    ConnectionsRoutingModule,
    LoggingModule,
    FontAwesomeModule,
    StoreModule.forFeature('connections', connectionReducer),
    EffectsModule.forFeature([ConnectionEffects]),
    QueuesModule,
    UiModule
  ],
  exports: [
    ConnectionPlaneComponent
  ]
})
export class ConnectionsModule { }
