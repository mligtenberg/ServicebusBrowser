import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';
import { QueuesEffects } from './queues.effects';
import { QueuePlaneComponent } from './queue-plane/queue-plane.component';
import { StoreModule } from '@ngrx/store';
import { queueReducer } from './ngrx/queues.reducers';
import { UiModule } from '../ui/ui.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { QueuePlaneItemComponent } from './queue-plane-item/queue-plane-item.component';
import { FormsModule } from '@angular/forms';
import { MessagesModule } from '../messages/messages.module';



@NgModule({
  declarations: [QueuePlaneComponent, QueuePlaneItemComponent],
  imports: [
    CommonModule,
    StoreModule.forFeature('queues', queueReducer),
    EffectsModule.forFeature([QueuesEffects]),
    UiModule,
    FontAwesomeModule,
    FormsModule,
    MessagesModule
  ],
  exports: [
    QueuePlaneComponent
  ]
})
export class QueuesModule { }
