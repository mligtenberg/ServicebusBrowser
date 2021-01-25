import { ISubscription, ITopic } from "../ngrx/topics.models";

export interface ISubscriptionSelectionEvent {
    type: SubscriptionSelectionType;
    clickPosition: {
        clientX: number,
        clientY: number
    };
    topic: ITopic;
    subscription: ISubscription;
}

export enum SubscriptionSelectionType {
    click,
    contextMenu
}