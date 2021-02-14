import { createAction, props } from "@ngrx/store";
import { ISubscription, ITopic } from "./topics.models";

// basic topic operations
export const refreshTopics = createAction('[Topic] refresh the available topic on the server for a specific connection', props<{connectionId: string}>());
export const refreshTopicsSuccess = createAction('[Topic] Topics where successfully refreshed', props<{connectionId: string, topics: ITopic[]}>());
export const refreshTopicsFailed = createAction('[Topic] Topics could not be refreshed', props<{connectionId: string, error: string}>());

// subscription operations
export const refreshSubscriptions = createAction('[Topic/subscription] refresh the subscriptions for a specified topic', props<{connectionId: string, topicName: string}>());
export const refreshSubscriptionsSuccess = createAction('[Topic/subscription] refreshed the subscriptions for a specified topic successfully', props<{connectionId: string, topicName: string, subscriptions: ISubscription[]}>());
export const refreshSubscriptionsFailed = createAction('[Topic/subscription] refreshing the subscriptions for a specified topic failed', props<{connectionId: string, topicName: string, reason: string}>());

export const updateTopic = createAction('[Topic] Update topic', props<{connectionId: string, topic: ITopic}>());
export const updateTopicSuccesful = createAction('[Topic] Updated topic sucesfully', props<{connectionId: string, topic: ITopic}>());
export const updateTopicFailed = createAction('[Topic] Updating topic failed', props<{connectionId: string, topic: ITopic, reason: string}>());

export const updateSubscription = createAction('[Topic/subscription] Update subscription', props<{connectionId: string, topicName: string, subscription: ISubscription}>());
export const updateSubscriptionSuccesful = createAction('[Topic/subscription] Updated subscription sucesfully', props<{connectionId: string, topicName: string, subscription: ISubscription}>());
export const updateSubscriptionFailed = createAction('[Topic/subscription] Updating subscription failed', props<{connectionId: string, topicName: string, subscription: ISubscription, reason: string}>());
