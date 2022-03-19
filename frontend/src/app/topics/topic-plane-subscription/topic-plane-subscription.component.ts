import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { ISubscriptionSelectionEvent, SubscriptionSelectionType } from '../models/ISubscriptionSelectionEvent';
import { ISubscription, ITopic } from '../ngrx/topics.models';
import { RuleProperties } from '@azure/service-bus';
import { ISubscriptionRuleSelectionEvent, SubscriptionRuleSelectionType } from '../models/ISubscriptionRuleSelectionEvent';

@Component({
    selector: 'app-topic-plane-subscription',
    templateUrl: './topic-plane-subscription.component.html',
    styleUrls: ['./topic-plane-subscription.component.scss'],
})
export class TopicPlaneSubscriptionComponent {
    @Input() connectionId: string;
    @Input() topic: ITopic;
    @Input() subscription: ISubscription;

    @Output() selected = new EventEmitter<ISubscriptionSelectionEvent>();
    @Output() contextMenuSelected = new EventEmitter<ISubscriptionSelectionEvent>();

    @Output() subscriptionRuleSelected = new EventEmitter<ISubscriptionRuleSelectionEvent>();

    @ViewChild('contextMenu')
    contextMenuReference: TemplateRef<any>;

    onSelected($event: MouseEvent): void {
        this.selected.emit({
            clickPosition: {
                clientX: $event.clientX,
                clientY: $event.clientY,
            },
            type: SubscriptionSelectionType.click,
            topic: this.topic,
            subscription: this.subscription,
        });

        $event.stopPropagation();
    }

    onRuleSelected($event: MouseEvent, rule: RuleProperties): void {
        this.subscriptionRuleSelected.emit({
            rule,
            topic: this.topic,
            subscription: this.subscription,
            type: SubscriptionRuleSelectionType.click,
            clickPosition: {
                clientX: $event.clientX,
                clientY: $event.clientY,
            },
        });
    }

    onContextMenuSelected($event: MouseEvent): void {
        this.contextMenuSelected.emit({
            clickPosition: {
                clientX: $event.clientX,
                clientY: $event.clientY,
            },
            type: SubscriptionSelectionType.contextMenu,
            topic: this.topic,
            subscription: this.subscription,
        });
    }
}
