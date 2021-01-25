import { ISubscription, ITopic } from "../ngrx/topics.models";

export interface ITopicSelectionEvent {
    type: TopicSelectionType;
    clickPosition: {
        clientX: number,
        clientY: number
    };
    topic: ITopic;
}

export enum TopicSelectionType {
    click,
    contextMenu
}