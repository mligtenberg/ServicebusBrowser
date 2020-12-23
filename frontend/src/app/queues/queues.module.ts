import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';
import { QueuesEffects } from './queues.effects';
import { QueuePlaneComponent } from './queue-plane/queue-plane.component';
import { StoreModule } from '@ngrx/store';
import { queueReducer } from './ngrx/queues.reducers';



@NgModule({
  declarations: [QueuePlaneComponent],
  imports: [
    CommonModule,
    StoreModule.forFeature('queues', queueReducer),
    EffectsModule.forFeature([QueuesEffects])
  ],
  exports: [
    QueuePlaneComponent
  ]
})
export class QueuesModule { }
