import {
  BrowserWindow,
  shell,
  screen,
  Menu,
  nativeTheme,
  protocol,
} from 'electron';
import { rendererAppName, rendererAppPort } from './constants';
import { environment } from '../environments/environment';
import path, { join } from 'path';
import { getMenu } from './menu';
import * as fs from 'fs';

export default class App {
  // Keep a global reference of the window object, if you don't, the window will
  // be closed automatically when the JavaScript object is garbage collected.
  static mainWindow: Electron.BrowserWindow;
  static application: Electron.App;
  static BrowserWindow;

  public static isDevelopmentMode() {
    const isEnvironmentSet: boolean = 'ELECTRON_IS_DEV' in process.env;
    const getFromEnvironment: boolean =
      parseInt(process.env.ELECTRON_IS_DEV, 10) === 1;

    return isEnvironmentSet ? getFromEnvironment : !environment.production;
  }

  private static onWindowAllClosed() {
    if (process.platform !== 'darwin') {
      App.application.quit();
    }
  }

  private static onClose() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    App.mainWindow = null;
  }

  private static onRedirect(event: any, url: string) {
    if (url !== App.mainWindow.webContents.getURL()) {
      // this is a normal external redirect, open it in a new browser window
      event.preventDefault();
      shell.openExternal(url);
    }
  }

  private static onReady() {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    if (rendererAppName) {
      App.loadNetworkStack();
      App.initMainWindow();
      App.loadMainWindow();
    }
  }

  private static onActivate() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (App.mainWindow === null) {
      App.onReady();
    }
  }

  private static loadNetworkStack() {
    const useDevServer = !App.application.isPackaged;

    protocol.handle('http', async (request) => {
      // Custom fetch
      if (useDevServer) {
        return await this.loadFromDevServer(request);
      } else {
        return await this.loadFromDisk(request);
      }
    });
  }

  private static loadFromDevServer(request: Request) {
    return fetch(request);
  }

  private static async loadFromDisk(request: Request) {
    const rendererRoot = join(__dirname, '..', rendererAppName);
    const requestUrl = new URL(request.url);
    const rawPath = decodeURIComponent(requestUrl.pathname);
    const normalizedPath = path.normalize(rawPath).replace(/^([/\\])+/, '');
    const relativePath =
      normalizedPath.length > 0 ? normalizedPath : 'index.html';
    const filePath = path.resolve(rendererRoot, relativePath);

    if (
      !filePath.startsWith(path.resolve(rendererRoot) + path.sep) &&
      filePath !== path.resolve(rendererRoot)
    ) {
      return new Response('Forbidden', {
        status: 403,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cross-Origin-Opener-Policy': 'same-origin',
          'Cross-Origin-Embedder-Policy': 'require-corp',
        },
      });
    }

    let resolvedFilePath = filePath;
    if (
      fs.existsSync(resolvedFilePath) &&
      fs.statSync(resolvedFilePath).isDirectory()
    ) {
      resolvedFilePath = path.join(resolvedFilePath, 'index.html');
    }

    if (!fs.existsSync(resolvedFilePath)) {
      resolvedFilePath = path.join(rendererRoot, 'index.html');
    }

    try {
      const content = await fs.promises.readFile(resolvedFilePath);
      const extension = path.extname(resolvedFilePath).toLowerCase();
      const mimeType = App.getMimeType(extension);

      return new Response(new Uint8Array(content), {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Cross-Origin-Opener-Policy': 'same-origin',
          'Cross-Origin-Embedder-Policy': 'require-corp',
        },
      });
    } catch {
      return new Response('Not Found', {
        status: 404,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cross-Origin-Opener-Policy': 'same-origin',
          'Cross-Origin-Embedder-Policy': 'require-corp',
        },
      });
    }
  }

  private static getMimeType(extension: string) {
    switch (extension) {
      case '.html':
        return 'text/html; charset=utf-8';
      case '.js':
        return 'application/javascript; charset=utf-8';
      case '.mjs':
        return 'application/javascript; charset=utf-8';
      case '.css':
        return 'text/css; charset=utf-8';
      case '.json':
        return 'application/json; charset=utf-8';
      case '.svg':
        return 'image/svg+xml';
      case '.png':
        return 'image/png';
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.gif':
        return 'image/gif';
      case '.ico':
        return 'image/x-icon';
      case '.webp':
        return 'image/webp';
      case '.woff':
        return 'font/woff';
      case '.woff2':
        return 'font/woff2';
      case '.ttf':
        return 'font/ttf';
      case '.map':
        return 'application/json; charset=utf-8';
      case '.wasm':
        return 'application/wasm';
      default:
        return 'application/octet-stream';
    }
  }

  private static initMainWindow() {
    const workAreaSize = screen.getPrimaryDisplay().workAreaSize;
    const width = Math.min(1280, workAreaSize.width || 1280);
    const height = Math.min(720, workAreaSize.height || 720);

    const additionalWebPreferences: Electron.WebPreferences = App.application
      .isPackaged
      ? { contextIsolation: true, sandbox: true, nodeIntegration: false }
      : { contextIsolation: true };

    // Create the browser window.
    App.mainWindow = new BrowserWindow({
      width: width,
      height: height,
      show: false,
      titleBarStyle: 'hiddenInset',
      frame: true,
      autoHideMenuBar: true,
      webPreferences: {
        ...additionalWebPreferences,
        contextIsolation: true,
        backgroundThrottling: false,
        preload: join(__dirname, 'main.preload.js'),
      },
    });
    App.setTheme('system');
    App.mainWindow.setMenu(null);
    App.mainWindow.center();

    App.mainWindow.on('enter-full-screen', () => {
      App.mainWindow.webContents.send('fullscreen-changed', true);
    });

    App.mainWindow.on('leave-full-screen', () => {
      App.mainWindow.webContents.send('fullscreen-changed', false);
    });

    // if main window is ready to show, close the splash window and show the main window
    App.mainWindow.once('ready-to-show', () => {
      const isDevMode =
        App.isDevelopmentMode() ||
        this.application.getVersion().includes('beta');
      Menu.setApplicationMenu(getMenu(isDevMode));
      App.mainWindow.show();
    });

    // handle all external redirects in a new browser window
    App.mainWindow.webContents.on('will-navigate', App.onRedirect);

    // Emitted when the window is closed.
    App.mainWindow.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      App.mainWindow = null;
    });
  }

  static setTheme(source: 'system' | 'dark' | 'light') {
    this.saveSetting('theme', source);
    nativeTheme.themeSource = source;
  }

  static getTheme() {
    return nativeTheme.themeSource;
  }

  private static loadMainWindow() {
    App.mainWindow.loadURL(`http://localhost:${rendererAppPort}`);
  }

  private static saveSetting<T>(key: string, value: T) {
    const userData = App.application.getPath('userData');
    const settingsPath = path.join(userData, 'settings.json');

    let settings = {};
    if (fs.existsSync(settingsPath)) {
      settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    }

    settings[key] = value;

    fs.writeFileSync(settingsPath, JSON.stringify(settings), 'utf8');
  }

  private static getSetting<T>(key: string): T | undefined {
    const userData = App.application.getPath('userData');
    const settingsPath = path.join(userData, 'settings.json');

    let settings = {};
    if (fs.existsSync(settingsPath)) {
      settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    }

    return settings[key];
  }

  static main(app: Electron.App, browserWindow: typeof BrowserWindow) {
    // we pass the Electron.App object and the
    // Electron.BrowserWindow into this function
    // so this class has no dependencies. This
    // makes the code easier to write tests for

    App.BrowserWindow = browserWindow;
    App.application = app;

    nativeTheme.themeSource = App.getSetting('theme') ?? 'system';

    App.application.on('window-all-closed', App.onWindowAllClosed); // Quit when all windows are closed.
    App.application.on('ready', App.onReady); // App is ready to load data
    App.application.on('activate', App.onActivate); // App is activated
  }
}
