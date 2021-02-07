import { IConnection } from "../ngrx/connections.models";

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