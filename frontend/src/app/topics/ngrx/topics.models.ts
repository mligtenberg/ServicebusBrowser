import { ITopic } from '../../../../../ipcModels/ITopic';

export {
    ITopic
}

export interface ITopicConnectionSet {
    connectionId: string,
    topics: ITopic[]
}