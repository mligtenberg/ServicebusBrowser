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
import { SubscriptionDetailsComponent } from './subscription-details/subscription-details.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { TopicDetailsComponent } from './topic-details/topic-details.component';
import { SubscriptionContextMenuComponent } from './subscription-context-menu/subscription-context-menu.component';
import { TopicsPlaneBaseComponent } from './topics-plane-base/topics-plane-base.component';

const routes: Routes = [
  { path: 'view/:connectionId/:topicName', component: TopicDetailsComponent },
  { path: 'view/:connectionId/:topicName/:subscriptionName', component: SubscriptionDetailsComponent }
];

@NgModule({
  declarations: [TopicsPlaneComponent, TopicsPlaneItemComponent, TopicPlaneSubscriptionComponent, SubscriptionDetailsComponent, TopicDetailsComponent, SubscriptionContextMenuComponent, TopicsPlaneBaseComponent],
  imports: [
    CommonModule,
    StoreModule.forFeature('topics', topicReducer),
    EffectsModule.forFeature([TopicsEffects]),
    UiModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    TopicsPlaneComponent
  ]
})
export class TopicsModule { }
