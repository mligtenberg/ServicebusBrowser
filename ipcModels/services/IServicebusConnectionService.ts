import { IConnection } from "..";

export interface IServicebusConnectionService {
    getClient(connection: IConnection): any;
    getAdminClient(connection: IConnection): any;
}