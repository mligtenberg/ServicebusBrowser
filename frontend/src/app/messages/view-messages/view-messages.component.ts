import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { IMessage, IMessageSet } from '../ngrx/messages.models';
import { MessagesComponentStoreService } from '../messages-component-store.service';
import { map } from 'rxjs/operators';

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

    constructor(private componentStore: MessagesComponentStoreService, private activeRoute: ActivatedRoute) {}

    ngOnInit(): void {
        this.componentStore.loadMessageSet(this.activeRoute.params.pipe(map((params) => params.messageSetId)));
    }
}
