import { ipcMain } from 'electron';
import { secretsChannels } from '../../../ipcModels/channels';
import { ISecret } from '../../../ipcModels/ISecret';
import { safeStorage, App } from 'electron';
import path from 'path';
import * as fs from 'fs';
import { Settings } from '../models/settings';

export function initSecretsHandler(app: App) {
    const userDataMainFolder = app.getPath('userData');
    const settingPath = path.join(userDataMainFolder, 'serviceBusBrowser.json');

    function readCurrentSettings(): Settings {
        let settings: Settings | undefined;
        if (fs.existsSync(settingPath)) {
            const fileContentBuffer = fs.readFileSync(settingPath);
            const fileContent = safeStorage.decryptString(fileContentBuffer);
            settings = JSON.parse(fileContent);
        }

        settings = settings || { savedConnections: {} };
        return settings;
    }

    function writeSettings(settings: Settings) {
        const settingsString = JSON.stringify(settings);
        const encryptedSettings = safeStorage.encryptString(settingsString);
        fs.writeFileSync(settingPath, encryptedSettings, {
            encoding: 'utf8',
        });
    }

    ipcMain.on(secretsChannels.ADD_SECRET, (event, ...args) => {
        if (args.length < 2) {
            event.reply(secretsChannels.ADD_SECRET_REPONSE, false, 'Not enough arguments');
        }

        const key = args[0] as string;
        const value = args[1] as string;

        if (safeStorage.isEncryptionAvailable()) {
            const settings = readCurrentSettings();

            settings.savedConnections[key] = {
                name: key,
                type: 'byConnectionString',
                connectionString: value,
            };

            writeSettings(settings);
        }
    });

    ipcMain.on(secretsChannels.DELETE_SECRET, (event, ...args) => {
        if (args.length < 1) {
            event.reply(secretsChannels.DELETE_SECRET_RESPONSE, false, 'Not enough arguments');
        }

        const key = args[0] as string;

        if (safeStorage.isEncryptionAvailable()) {
            const settings = readCurrentSettings();

            if (settings.savedConnections[key] !== undefined) {
                delete settings.savedConnections[key];
            }

            writeSettings(settings);
        }
    });

    ipcMain.on(secretsChannels.GET_SECRETS, (event, ...args) => {
        if (safeStorage.isEncryptionAvailable()) {
            const settings = readCurrentSettings();
            const secrets = Object.values(settings.savedConnections).map((c) => {
                return { key: c.name, value: c.connectionString } as ISecret;
            });
            event.reply(secretsChannels.GET_SECRETS_RESPONSE, true, secrets);
        } else {
            event.reply(secretsChannels.GET_SECRETS_RESPONSE, false, 'Encryption is not available');
        }
    });
}
