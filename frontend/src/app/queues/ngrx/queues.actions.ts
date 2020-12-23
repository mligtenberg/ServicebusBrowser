import { createAction, props } from "@ngrx/store";
import { IQueue } from "./queues.models";

// basic connection operations
export const refreshQueues = createAction('[Queue] refresh the available queues on the server for a specific connection', props<{connectionId: string}>());
export const refreshQueuesSuccess = createAction('[Queue] Queues where successfully refreshed', props<{connectionId: string, queues: IQueue[]}>());
export const refreshQueuesFailed = createAction('[Queue] Queues could not be refreshed', props<{connectionId: string, error: string}>());
