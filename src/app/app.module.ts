import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { UiModule } from './ui/ui.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MainComponent } from './main/main.component';
import { NgrxModule } from './ngrx.module';
import { ConnectionsModule } from './connections/connections.module';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { EffectsModule } from '@ngrx/effects';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { LoggingModule } from './logging/logging.module';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgrxModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    UiModule,
    FontAwesomeModule,
    ConnectionsModule,
    StoreDevtoolsModule.instrument({ name: "Servicebus Browser", maxAge: 25, logOnly: environment.production }),
    EffectsModule.forRoot([]),
    StoreRouterConnectingModule.forRoot(),
    LoggingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
