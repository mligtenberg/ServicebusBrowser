import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { messagesReducer } from './ngrx/messages.reducers';
import { EffectsModule } from '@ngrx/effects';
import { MessagesEffects } from './messages.effects';
import { ViewMessagesComponent } from './messages/view-messages/view-messages.component';
import { RouterModule, Routes } from '@angular/router';
import { GetMessagesDialogComponent } from './get-mesages-dialog/get-messages-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QueueMessageComponent } from './queue/queue-message/queue-message.component';
import { UiModule } from '../ui/ui.module';
import { SelectMessageTargetDialogComponent } from './select-message-target-dialog/select-message-target-dialog.component';
import { ConnectionsModule } from '../connections/connections.module';
import { NuMonacoEditorModule } from '@ng-util/monaco-editor';
import { MessagesTableComponent } from './messages/messages-table/messages-table.component';
import { CdkTableModule } from '@angular/cdk/table';
import { MessagesBodyComponent } from './messages/messages-body/messages-body.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

const routes: Routes = [
    { path: 'view/:messageSetId', component: ViewMessagesComponent },
    { path: 'queue', component: QueueMessageComponent },
    { path: 'requeue/:messageSetId/:messageId', component: QueueMessageComponent },
];

@NgModule({
    declarations: [
        ViewMessagesComponent,
        GetMessagesDialogComponent,
        QueueMessageComponent,
        SelectMessageTargetDialogComponent,
        MessagesTableComponent,
        MessagesBodyComponent,
    ],
    imports: [
        CommonModule,
        StoreModule.forFeature('messages', messagesReducer),
        EffectsModule.forFeature([MessagesEffects]),
        RouterModule.forChild(routes),
        FormsModule,
        ReactiveFormsModule,
        UiModule,
        NuMonacoEditorModule,
        ConnectionsModule,
        CdkTableModule,
        FontAwesomeModule,
    ],
    exports: [GetMessagesDialogComponent],
})
export class MessagesModule {}
