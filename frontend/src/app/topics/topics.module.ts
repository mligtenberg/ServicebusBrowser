import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { topicReducer } from './ngrx/topics.reducers';
import { EffectsModule } from '@ngrx/effects';
import { TopicsEffects } from './topics.effects';
import { TopicsPlaneComponent } from './topics-plane/topics-plane.component';
import { UiModule } from '../ui/ui.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [TopicsPlaneComponent],
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
