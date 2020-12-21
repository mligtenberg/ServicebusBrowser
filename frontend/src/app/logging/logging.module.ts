import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { loggingReducer } from './ngrx/logging.reducers';
import { StoreModule } from '@ngrx/store';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StoreModule.forFeature('logging', loggingReducer),
  ]
})
export class LoggingModule { }
