import { Component, Input, OnChanges, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { IConnection } from 'src/app/connections/ngrx/connections.models';
import { LogService } from 'src/app/logging/log.service';
import { State } from 'src/app/ngrx.module';
import { ISubscriptionSelectionEvent } from '../models/ISubscriptionSelectionEvent';
import { ITopicSelectionEvent } from '../models/ITopicSelectionEvent';
import { refreshTopics } from '../ngrx/topics.actions';
import { ITopic } from '../ngrx/topics.models';
import { getTopics, getTopicsLoading } from '../ngrx/topics.selectors';
import { ISubscriptionRuleSelectionEvent } from '../models/ISubscriptionRuleSelectionEvent';

@Component({
    selector: 'app-topics-plane-base',
    templateUrl: './topics-plane-base.component.html',
    styleUrls: ['./topics-plane-base.component.scss'],
})
export class TopicsPlaneBaseComponent implements OnChanges, OnDestroy {
    @Input()
    connection: IConnection;
    @Input()
    showSubscriptions: boolean;

    @Output()
    subscriptionSelected = new EventEmitter<ISubscriptionSelectionEvent>();
    @Output()
    subscriptionContextMenuSelected = new EventEmitter<ISubscriptionSelectionEvent>();

    @Output()
    subscriptionRuleSelected = new EventEmitter<ISubscriptionRuleSelectionEvent>();

    @Output()
    topicSelected = new EventEmitter<ITopicSelectionEvent>();
    @Output()
    topicContextMenuSelected = new EventEmitter<ITopicSelectionEvent>();

    topics: ITopic[];
    topicsSubscription: Subscription;
    loading = false;

    constructor(private store: Store<State>, private log: LogService) {}

    ngOnChanges(): void {
        this.resubscribe();
    }

    ngOnDestroy(): void {
        this.topicsSubscription.unsubscribe();
    }

    resubscribe(): void {
        if (this.topicsSubscription) {
            this.topicsSubscription.unsubscribe();
        }

        this.topicsSubscription = new Subscription();

        if (!this.connection) {
            this.log.logError('Cannot load topics since connection is not set');
            return;
        }

        this.topicsSubscription.add(
            this.store.select(getTopics(this.connection.id)).subscribe((topics) => {
                this.topics = topics;
            })
        );

        this.topicsSubscription.add(
            this.store.select(getTopicsLoading(this.connection.id)).subscribe((isLoading) => {
                this.loading = isLoading;
            })
        );
    }

    refreshTopics($event: Event | null): void {
        if (this.connection) {
            this.store.dispatch(refreshTopics({ connectionId: this.connection.id }));
        } else {
            this.topics = [];
        }

        $event?.stopPropagation();
    }

    onSubscriptionSelected(event: ISubscriptionSelectionEvent): void {
        this.subscriptionSelected.emit(event);
    }

    onSubscriptionContextMenuSelected(event: ISubscriptionSelectionEvent): void {
        this.subscriptionContextMenuSelected.emit(event);
    }

    onSubscriptionRuleSelected(event: ISubscriptionRuleSelectionEvent): void {
        this.subscriptionRuleSelected.emit(event);
    }

    onTopicSelected(event: ITopicSelectionEvent): void {
        this.topicSelected.emit(event);
    }

    onTopicContextMenuSelected(event: ITopicSelectionEvent): void {
        this.topicContextMenuSelected.emit(event);
    }
}
