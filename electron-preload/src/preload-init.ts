import { contextBridge } from "electron";
import { ISecret } from "../../ipcModels";
import { SecretService } from "./services/SecretService";


const secretService = new SecretService();
contextBridge.exposeInMainWorld('secrets', {
    getSecrets: () => secretService.getSecrets(),
    saveSecret: (secret: ISecret) => secretService.saveSecret(secret),
    deleteSecret: (secretKey: string) => secretService.deleteSecret(secretKey)
});