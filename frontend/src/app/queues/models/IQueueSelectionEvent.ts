import { IQueue } from "../ngrx/queues.models";

export interface IQueueSelectionEvent {
    type: QueueSelectionType,
    clickPosition: {
        clientX: number,
        clientY: number
    },
    queue: IQueue
}

export enum QueueSelectionType {
    click,
    contextMenu
}