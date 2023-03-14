import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { IMessage, IMessageSet } from '../../ngrx/messages.models';
import { MessagesComponentStoreService } from '../messages-component-store.service';
import { map, takeUntil } from 'rxjs/operators';
import { faEnvelope, faEnvelopesBulk } from '@fortawesome/free-solid-svg-icons';
import { ConfirmDialogBodyComponent, ConfirmDialogOptions } from '../../../ui/confirm-dialog-body/confirm-dialog-body.component';
import { DialogsService } from '../../../ui/dialogs/dialogs.service';

@Component({
    selector: 'app-view-messages',
    templateUrl: './view-messages.component.html',
    styleUrls: ['./view-messages.component.scss'],
    providers: [MessagesComponentStoreService],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewMessagesComponent implements OnInit {
    get messageSet$(): Observable<IMessageSet> {
        return this.componentStore.messageSet$;
    }
    get currentMessage$(): Observable<IMessage> {
        return this.componentStore.currentMessage$;
    }

    get requeueIcon() {
        return faEnvelope;
    }

    get requeueAllIcon() {
        return faEnvelopesBulk;
    }

    constructor(
        private componentStore: MessagesComponentStoreService,
        private dialogService: DialogsService,
        private router: Router,
        private activeRoute: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this.componentStore.loadMessageSet(this.activeRoute.params.pipe(map((params) => params.messageSetId)));
    }

    requeueMessage(messageSet: IMessageSet, message: IMessage): void {
        this.router.navigate(['messages', 'requeue', messageSet.messageSetId, message.id]);
    }

    requeueAll(): void {
        this.dialogService
            .open<boolean>(ConfirmDialogBodyComponent, {
                data: {
                    title: 'Requeue all?',
                    message: 'Are you sure you want to requeue all messages?',
                } as ConfirmDialogOptions,
            })
            .closed.pipe(takeUntil(this.componentStore.destroy$))
            .subscribe((result) => {
                if (result) {
                    this.componentStore.requeueAllMessages();
                }
            });
    }
}
