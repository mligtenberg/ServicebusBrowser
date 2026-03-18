import SquirrelEvents from './app/events/squirrel.events';
import ElectronEvents from './app/events/electron.events';
import { app, BrowserWindow, protocol, session } from 'electron';
import App from './app/app';
import ServiceBusEvents from './app/events/service-bus.events';
import UpdateEvents from './app/events/update.events';
import * as fs from 'node:fs';
import * as path from 'node:path';

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: false,
      allowServiceWorkers: true,
      corsEnabled: true,
    },
  },
]);

export default class Main {
  static initialize() {
    const gotSingleInstanceLock = app.requestSingleInstanceLock();
    if (!gotSingleInstanceLock) {
      app.quit();
      return;
    }

    app.on('second-instance', () => {
      if (App.mainWindow) {
        if (App.mainWindow.isMinimized()) {
          App.mainWindow.restore();
        }
        App.mainWindow.focus();
      }
    });

    if (App.isDevelopmentMode()) {
      const appDataPath = app.getPath('appData');
      app.setPath(
        'userData',
        path.join(appDataPath, 'servicebus-browser-app-dev'),
      );
    }

    if (SquirrelEvents.handleEvents()) {
      // squirrel event handled (except first run event) and app will exit in 1000ms, so don't do anything else
      app.quit();
    }
  }

  static bootstrapApp() {
    App.main(app, BrowserWindow);
  }

  static bootstrapAppEvents() {
    ElectronEvents.bootstrapElectronEvents();
    ServiceBusEvents.bootstrapServiceBusEvents();

    // initialize auto updater service
    UpdateEvents.initAutoUpdateService();
  }
}

// handle setup events as quickly as possible
Main.initialize();

async function initExtensions() {
  if (!App.isDevelopmentMode()) {
    return;
  }

  // if a file called extensions.json exists, thread it as a string array of extensions to install
  const extensionsJsonPath = './extensions.json';
  // if file exists, load contents and parse as array of extensions to install
  const contents = fs.existsSync(extensionsJsonPath)
    ? JSON.parse(fs.readFileSync(extensionsJsonPath, 'utf8'))
    : [];

  const installedExtensions =
    session.defaultSession.extensions.getAllExtensions();
  const normalizePath = (extensionPath: string) =>
    path.resolve(extensionPath).replace(/[\\/]+$/, '');

  const installedExtensionPaths = new Set(
    installedExtensions
      .map((extension) => (extension as { path?: string }).path)
      .filter((extensionPath): extensionPath is string =>
        Boolean(extensionPath),
      )
      .map((extensionPath) => normalizePath(extensionPath)),
  );

  for (const extensionPath of contents) {
    const normalizedExtensionPath = normalizePath(extensionPath);

    if (installedExtensionPaths.has(normalizedExtensionPath)) {
      console.log(`Extension already installed: ${extensionPath}`);
      continue;
    }

    console.log(`Installing extension: ${extensionPath}`);

    try {
      await session.defaultSession.extensions.loadExtension(extensionPath);
      installedExtensionPaths.add(normalizedExtensionPath);
    } catch (error) {
      console.error(`Failed to install extension: ${extensionPath}`, error);
    }
  }
}

// bootstrap app
Main.bootstrapApp();
Main.bootstrapAppEvents();

if (App.isDevelopmentMode()) {
  App.application
    .whenReady()
    .then(() => initExtensions())
    .then(() => {
      App.mainWindow?.webContents.openDevTools();
    })
    .catch((err) => console.log('An error occurred: ', err));
}
