import { IConnection } from "../../../../../ipcModels";

export interface ITargetSelectedEvent {
    connection: IConnection;
    type: TargetSelectionType;
    name: string;
}

export enum TargetSelectionType {
    queue,
    topic,
    subscription
}