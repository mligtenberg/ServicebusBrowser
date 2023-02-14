import { ChangeDetectionStrategy, Component, OnChanges, TemplateRef, ViewChild } from '@angular/core';
import { CdkTableDataSourceInput } from '@angular/cdk/table';
import { IMessageTableRow } from '../../ngrx/messages.models';
import { MessagesComponentStoreService } from '../messages-component-store.service';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ContextmenuService } from '../../../ui/contextmenu.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-messages-table',
    templateUrl: './messages-table.component.html',
    styleUrls: ['./messages-table.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessagesTableComponent {
    get dataSource$(): CdkTableDataSourceInput<IMessageTableRow> {
        return this.componentStore.messagesTableRows$;
    }

    get currentMessageId$(): Observable<string> {
        return this.componentStore.currentMessage$.pipe(map((message) => message?.id));
    }

    constructor(private componentStore: MessagesComponentStoreService, private contextMenu: ContextmenuService, private router: Router) {}

    selectMessage(messageId: string): void {
        this.componentStore.setCurrentMessage(messageId);
    }
}
