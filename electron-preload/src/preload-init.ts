import { contextBridge } from "electron";
import { IConnection, ISecret } from "../../ipcModels";
import { SecretService } from "./services/SecretService";
import { ServicebusConnectionService } from "./services/ServicebusConnectionService";
import adminClientTransform from "./transformers/servicebusAdminClientTransformer";
import clientTransform from "./transformers/servicebusClientTransformer";


const secretService = new SecretService();
contextBridge.exposeInMainWorld('secrets', {
    getSecrets: () => secretService.getSecrets(),
    saveSecret: (secret: ISecret) => secretService.saveSecret(secret),
    deleteSecret: (secretKey: string) => secretService.deleteSecret(secretKey)
});

const servicebusConnectionService = new ServicebusConnectionService();
contextBridge.exposeInMainWorld('servicebusConnections', {
    getAdminClient: (connection: IConnection) => {
        const adminClient = servicebusConnectionService.getAdminClient(connection);     
        return adminClientTransform(adminClient);
    },
    getClient: (connection: IConnection) => {
        const client = servicebusConnectionService.getClient(connection);
        return clientTransform(client);
    }
});