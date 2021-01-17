import { ipcRenderer } from "electron";
import {
  secretsChannels,
  ISecret,
} from "../../../ipcModels";
import {
    ISecretService
  } from "../../../ipcModels/services";

export class SecretService implements ISecretService {
  saveSecret(secret: ISecret): Promise<void> {
    const promise = new Promise<void>((resolve, reject) => {
      ipcRenderer.once(secretsChannels.ADD_SECRET_REPONSE, (event, ...args) => {
        const success = args[0] as boolean;

        if (success) {
          resolve();
        } else {
          const reason = args[1] as string;
          reject(reason);
        }
      });
    });

    ipcRenderer.send(secretsChannels.ADD_SECRET, secret.key, secret.value);
    return promise;
  }

  deleteSecret(secretKey: string): Promise<void> {
    var promise = new Promise<void>((resolve, reject) => {
        ipcRenderer.once(secretsChannels.DELETE_SECRET_RESPONSE, (event, ...args) => {
          const success = args[0] as boolean;
          
          if (success) {
            resolve();
          } else {
            const reason = args[1] as string;
            reject(reason);
          }
        });
      });
  
      ipcRenderer.send(secretsChannels.DELETE_SECRET, secretKey);
      return promise;
  }

  getSecrets(): Promise<ISecret[]> {
    var promise = new Promise<ISecret[]>((resolve, reject) => {
        ipcRenderer.once(secretsChannels.GET_SECRETS_RESPONSE, (event, ...args) => {
          const success = args[0] as boolean;

          if (success) {
            const secrets = args[1] as ISecret[];
            resolve(secrets);
          } else {
            const reason = args[1] as string;
            reject(reason);
          }
        });
      });
  
      ipcRenderer.send(secretsChannels.GET_SECRETS);
      return promise;
  }
}
