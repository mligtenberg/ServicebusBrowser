import { ITopic, ISubscription } from '../../../../../ipcModels/ITopic';

export {
    ITopic,
    ISubscription
}

export interface ITopicConnectionSet {
    connectionId: string,
    topics: ITopic[]
}

export interface ISubscriptionTopicSet {
    connectionId: string,
    topicName: string,
    subscriptions: ISubscription[]
}