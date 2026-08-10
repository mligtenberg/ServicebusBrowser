import SquirrelEvents from './app/events/squirrel.events';
import ElectronEvents from './app/events/electron.events';
import { app, BrowserWindow, protocol, session } from 'electron';
import App from './app/app';
import ServiceBusEvents from './app/events/service-bus.events';
import WorkspaceEvents from './app/events/workspace.events';
import UpdateEvents from './app/events/update.events';
import McpEvents from './app/events/mcp.events';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { electronAppInternalName } from './app/constants';

// Must run before anything else touches the app lifecycle: this pins the
// userData folder and safeStorage Keychain identity to a name that never
// changes, decoupled from the user-facing electronAppName. See constants.ts.
if (!App.isDevelopmentMode()) {
  app.setName(electronAppInternalName);
}

if (App.isDevelopmentMode()) {
  // Prevent GPU process crashes in dev/sandbox environments (exit_code=15)
  // in-process-gpu keeps rendering working unlike disable-gpu which causes blank screens on reload
  app.commandLine.appendSwitch('in-process-gpu');
  // Run network service in-process to prevent out-of-process crashes
  app.commandLine.appendSwitch('enable-features', 'NetworkServiceInProcess2');
}

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
    // Must happen before requestSingleInstanceLock(): the lock is scoped to
    // the current userData path, so dev needs its own path *before* locking,
    // otherwise it collides with an already-running packaged install and
    // quits immediately (no window, no error).
    if (App.isDevelopmentMode()) {
      const appDataPath = app.getPath('appData');
      app.setPath(
        'userData',
        path.join(appDataPath, 'servicebus-browser-app-dev'),
      );
    }

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
    WorkspaceEvents.bootstrapWorkspaceEvents();

    // initialize auto updater service
    UpdateEvents.initAutoUpdateService();

    // Starts the MCP server (ADR-0010) if it was left enabled in settings.
    // Must wait for 'ready': when MCP was already enabled in a previous
    // session, applySettings() -> App.setMcpEnabled() creates a Tray icon,
    // and Electron throws if a Tray is created before the app is ready.
    // bootstrapAppEvents() runs synchronously at module load, well before
    // 'ready' fires, so that throw used to abort applySettings() before it
    // ever reached mcpServerHost.start() — MCP looked enabled in settings,
    // but nothing was actually listening until the user re-toggled it from
    // the running (and by then definitely ready) app.
    void app.whenReady().then(() => McpEvents.bootstrapMcpEvents());
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
