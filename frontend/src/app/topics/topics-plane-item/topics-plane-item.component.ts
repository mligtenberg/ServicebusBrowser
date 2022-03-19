import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { LogService } from 'src/app/logging/log.service';
import { State } from 'src/app/ngrx.module';
import { ISubscriptionSelectionEvent } from '../models/ISubscriptionSelectionEvent';
import { ITopicSelectionEvent, TopicSelectionType } from '../models/ITopicSelectionEvent';
import { refreshSubscriptions } from '../ngrx/topics.actions';
import { ISubscription, ITopic } from '../ngrx/topics.models';
import { getSubscriptionsLoading, getTopicSubscriptions } from '../ngrx/topics.selectors';
import { ISubscriptionRuleSelectionEvent } from '../models/ISubscriptionRuleSelectionEvent';

@Component({
    selector: 'app-topics-plane-item',
    templateUrl: './topics-plane-item.component.html',
    styleUrls: ['./topics-plane-item.component.scss'],
})
export class TopicsPlaneItemComponent implements OnInit, OnDestroy {
    @Input()
    connectionId: string;

    @Input()
    topic: ITopic;

    @Input()
    showSubscriptions: boolean;

    @Output()
    subscriptionSelected = new EventEmitter<ISubscriptionSelectionEvent>();
    @Output()
    subscriptionContextMenuSelected = new EventEmitter<ISubscriptionSelectionEvent>();

    @Output()
    subscriptionRuleSelected = new EventEmitter<ISubscriptionRuleSelectionEvent>();

    @Output()
    selected = new EventEmitter<ITopicSelectionEvent>();
    @Output()
    contextMenuSelected = new EventEmitter<ITopicSelectionEvent>();

    subscriptions: ISubscription[] = [];
    loading = false;

    subs = new Subscription();

    constructor(private store: Store<State>, private log: LogService) {}

    ngOnInit(): void {
        this.subs.add(
            this.store.select(getTopicSubscriptions(this.connectionId, this.topic.name)).subscribe((s) => {
                this.subscriptions = s;
            })
        );

        this.subs.add(
            this.store.select(getSubscriptionsLoading(this.connectionId, this.topic.name)).subscribe((isLoading) => {
                this.loading = isLoading;
            })
        );
    }

    refreshSubscriptions($event: Event = null): void {
        this.log.logInfo(`Refreshing topics for '${this.topic.name}'`);
        this.store.dispatch(refreshSubscriptions({ connectionId: this.connectionId, topicName: this.topic.name }));

        $event?.stopPropagation();
    }

    onSubscriptionSelected(event: ISubscriptionSelectionEvent): void {
        this.subscriptionSelected.emit(event);
    }

    onContextMenuSubscriptionSelected(event: ISubscriptionSelectionEvent): void {
        this.subscriptionContextMenuSelected.emit(event);
    }

    onSubscriptionRuleSelected(event: ISubscriptionRuleSelectionEvent): void {
        this.subscriptionRuleSelected.emit(event);
    }

    onSelected($event: MouseEvent): void {
        this.selected.emit({
            clickPosition: {
                clientX: $event.clientX,
                clientY: $event.clientY,
            },
            type: TopicSelectionType.click,
            topic: this.topic,
        });
    }

    onContextMenuSelected($event: MouseEvent): void {
        this.selected.emit({
            clickPosition: {
                clientX: $event.clientX,
                clientY: $event.clientY,
            },
            type: TopicSelectionType.contextMenu,
            topic: this.topic,
        });
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }
}
