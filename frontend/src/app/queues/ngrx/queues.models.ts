import { IQueue } from '../../../../../ipcModels/IQueue';

export {
    IQueue
}

export interface IQueueConnectionSet {
    connectionId: string,
    queues: IQueue[]
}