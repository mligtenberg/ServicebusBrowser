import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { UiModule } from './ui/ui.module';
import { MainComponent } from './main/main.component';
import { NgrxModule } from './ngrx.module';
import { ConnectionsModule } from './connections/connections.module';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { EffectsModule } from '@ngrx/effects';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { LoggingModule } from './logging/logging.module';
import { TopicsModule } from './topics/topics.module';
import { MessagesModule } from './messages/messages.module';
import { MainEffectsEffects } from './main-effects.effects';
import { NuMonacoEditorModule } from '@ng-util/monaco-editor';

@NgModule({
    declarations: [AppComponent, MainComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        NgrxModule,
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
        UiModule,
        ConnectionsModule,
        StoreDevtoolsModule.instrument({ name: 'Servicebus Browser', maxAge: 25, logOnly: environment.production }),
        EffectsModule.forRoot([]),
        StoreRouterConnectingModule.forRoot(),
        LoggingModule,
        TopicsModule,
        MessagesModule,
        EffectsModule.forRoot([MainEffectsEffects]),
        NuMonacoEditorModule.forRoot({
            baseUrl: `lib`,
        }),
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
