import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { topicReducer } from './ngrx/topics.reducers';
import { EffectsModule } from '@ngrx/effects';
import { TopicsEffects } from './topics.effects';
import { TopicsPlaneComponent } from './topics-plane/topics-plane.component';
import { UiModule } from '../ui/ui.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TopicsPlaneItemComponent } from './topics-plane-item/topics-plane-item.component';
import { TopicPlaneSubscriptionComponent } from './topic-plane-subscription/topic-plane-subscription.component';

@NgModule({
  declarations: [TopicsPlaneComponent, TopicsPlaneItemComponent, TopicPlaneSubscriptionComponent],
  imports: [
    CommonModule,
    StoreModule.forFeature('topics', topicReducer),
    EffectsModule.forFeature([TopicsEffects]),
    UiModule,
    FontAwesomeModule
  ],
  exports: [
    TopicsPlaneComponent
  ]
})
export class TopicsModule { }
