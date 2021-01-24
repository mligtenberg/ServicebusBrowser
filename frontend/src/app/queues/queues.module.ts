import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';
import { QueuesEffects } from './queues.effects';
import { QueuePlaneBaseComponent } from './queue-plane-base/queue-plane-base.component';
import { StoreModule } from '@ngrx/store';
import { queueReducer } from './ngrx/queues.reducers';
import { UiModule } from '../ui/ui.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { QueuePlaneItemComponent } from './queue-plane-item/queue-plane-item.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessagesModule } from '../messages/messages.module';
import { QueueDetailsComponent } from './queue-details/queue-details.component';
import { RouterModule, Routes } from '@angular/router';
import { QueuePlaneComponent } from './queue-plane/queue-plane.component';
import { QueueContextMenuComponent } from './queue-context-menu/queue-context-menu.component';

const routes: Routes = [
  { path: 'view/:connectionId/:queueName', component: QueueDetailsComponent }
];

@NgModule({
  declarations: [QueuePlaneBaseComponent, QueuePlaneItemComponent, QueueDetailsComponent, QueuePlaneComponent, QueueContextMenuComponent],
  imports: [
    CommonModule,
    StoreModule.forFeature('queues', queueReducer),
    EffectsModule.forFeature([QueuesEffects]),
    UiModule,
    FontAwesomeModule,
    FormsModule,
    MessagesModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule
  ],
  exports: [
    QueuePlaneComponent
  ]
})
export class QueuesModule { }
