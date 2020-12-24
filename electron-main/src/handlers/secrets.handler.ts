import { ipcMain } from "electron";
import { secretsChannels } from "../../../ipcModels/channels";
import { ISecret } from "../../../ipcModels/ISecret";
import * as keytar from 'keytar';
import { SERVICE_NAME } from "../constants";

export function initSecretsHandler() {
    ipcMain.on(secretsChannels.ADD_SECRET, (event, ...args) => {
      if (args.length < 2) {
        event.reply(secretsChannels.ADD_SECRET_REPONSE, false, 'Not enough arguments')
      }
      
      const key = args[0] as string;
      const value = args[1] as string;

      keytar.setPassword(SERVICE_NAME, key, value).then(() => {
        event.reply(secretsChannels.ADD_SECRET_REPONSE, true);
      })
      .catch((reason) => {
        console.log(reason);
        if (typeof reason === 'string') {
          event.reply(secretsChannels.ADD_SECRET_REPONSE, false, reason)
        }
        if (reason.message !== undefined) {
          event.reply(secretsChannels.ADD_SECRET_REPONSE, false, reason.message)
        }
        event.reply(secretsChannels.ADD_SECRET_REPONSE, false, 'Reason unknown')
      })
    });

    ipcMain.on(secretsChannels.DELETE_SECRET, (event, ...args) => {
      if (args.length < 1) {
        event.reply(secretsChannels.DELETE_SECRET_RESPONSE, false, 'Not enough arguments')
      }
      
      const key = args[0] as string;

      keytar.deletePassword(SERVICE_NAME, key).then(() => {
        event.reply(secretsChannels.DELETE_SECRET_RESPONSE, true);
      })
      .catch((reason) => {
        if (typeof reason === 'string') {
          event.reply(secretsChannels.DELETE_SECRET_RESPONSE, false, reason)
        }
        if (reason.message !== undefined) {
          event.reply(secretsChannels.DELETE_SECRET_RESPONSE, false, reason.message)
        }
        event.reply(secretsChannels.DELETE_SECRET_RESPONSE, false, 'Reason unknown')
      })
    });

    ipcMain.on(secretsChannels.GET_SECRETS, (event, ...args) => {
      keytar.findCredentials(SERVICE_NAME)
      .then((result) => {
        event.reply(secretsChannels.GET_SECRETS_RESPONSE, true, result.map(r => {
          return {key: r.account, value: r.password} as ISecret
        }));
      })
      .catch((reason) => {
        if (typeof reason === 'string') {
          event.reply(secretsChannels.GET_SECRETS_RESPONSE, false, reason)
        }
        if (reason.message !== undefined) {
          event.reply(secretsChannels.GET_SECRETS_RESPONSE, false, reason.message)
        }
        event.reply(secretsChannels.GET_SECRETS_RESPONSE, false, 'Reason unknown')
      })
    });
  }
  