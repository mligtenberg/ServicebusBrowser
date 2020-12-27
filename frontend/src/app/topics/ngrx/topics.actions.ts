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