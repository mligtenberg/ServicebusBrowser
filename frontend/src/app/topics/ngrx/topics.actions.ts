import { createAction, props } from "@ngrx/store";
import { ITopic } from "./topics.models";

// basic connection operations
export const refreshTopics = createAction('[Topic] refresh the available topic on the server for a specific connection', props<{connectionId: string}>());
export const refreshTopicsSuccess = createAction('[Topic] Topics where successfully refreshed', props<{connectionId: string, topics: ITopic[]}>());
export const refreshTopicsFailed = createAction('[Topic] Topics could not be refreshed', props<{connectionId: string, error: string}>());
