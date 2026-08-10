import {
  BrowserWindow,
  shell,
  screen,
  Menu,
  nativeTheme,
  protocol,
  Tray,
  nativeImage,
} from 'electron';
import {
  headlessRendererAppName,
  rendererAppName,
  rendererAppPort,
} from './constants';
import { environment } from '../environments/environment';
import path, { join } from 'path';
import { getMenu } from './menu';
import * as fs from 'fs';
import { runMigration } from './events/migration';
import { forgetWindow } from './events/workspace-window-registry';

export default class App {
  // Keep a global reference of the window object, if you don't, the window will
  // be closed automatically when the JavaScript object is garbage collected.
  static mainWindow: Electron.BrowserWindow | null = null;
  // All open app windows (including mainWindow), so extra windows opened via
  // "New Window" survive as long as they're referenced somewhere.
  static windows: Electron.BrowserWindow[] = [];
  static application: Electron.App;
  static BrowserWindow: typeof BrowserWindow | null = null;

  // Set only while the MCP server (ADR-0010/0011) is enabled — its presence
  // is what keeps the app running (and shows a tray icon) after the last
  // window closes, since a hidden query window may still need to exist.
  private static tray: Electron.Tray | null = null;
  private static mcpEnabled = false;

  public static isDevelopmentMode() {
    const isEnvironmentSet: boolean = 'ELECTRON_IS_DEV' in process.env;
    const getFromEnvironment: boolean =
      parseInt(process.env.ELECTRON_IS_DEV ?? '0', 10) === 1;

    return isEnvironmentSet ? getFromEnvironment : !environment.production;
  }

  private static onWindowAllClosed() {
    if (App.mcpEnabled) {
      // A hidden query window (ADR-0011) may still need to exist, and the
      // tray icon is the only way back in — don't quit like normal.
      return;
    }
    if (process.platform !== 'darwin') {
      App.application.quit();
    }
  }

  /**
   * Called whenever the MCP enabled setting changes (including at boot).
   * Shows/hides the tray icon that keeps the app reachable when every
   * window is closed while MCP is enabled.
   */
  static setMcpEnabled(enabled: boolean, onRegenerateToken: () => void): void {
    App.mcpEnabled = enabled;

    if (!enabled) {
      App.tray?.destroy();
      App.tray = null;
      return;
    }

    if (App.tray) {
      return;
    }

    // macOS menu-bar icons must be "template" images (solid black + alpha)
    // so the OS can recolor them for the light/dark menu bar; Windows/Linux
    // tray icons render as-is, so they get a colored dot instead. Electron
    // auto-picks up the sibling "@2x" file for retina displays as long as
    // it sits next to the base filename.
    const iconFile =
      process.platform === 'darwin' ? 'tray-iconTemplate.png' : 'tray-icon.png';
    const iconPath = join(__dirname, 'assets', 'tray', iconFile);
    const trayIcon = nativeImage.createFromPath(iconPath);
    trayIcon.setTemplateImage(process.platform === 'darwin');
    App.tray = new Tray(trayIcon);
    App.tray.setToolTip(`${App.application.name} (MCP server running)`);
    App.tray.setContextMenu(
      Menu.buildFromTemplate([
        {
          label: 'Open',
          click: () => {
            if (App.mainWindow) {
              if (App.mainWindow.isMinimized()) App.mainWindow.restore();
              App.mainWindow.focus();
            } else {
              App.initWindow();
            }
          },
        },
        { label: 'Regenerate MCP Token', click: onRegenerateToken },
        { type: 'separator' },
        { label: 'Quit', click: () => App.application.quit() },
      ]),
    );
  }

  private static onClose() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    App.mainWindow = null;
  }

  private static onRedirect(
    event: any,
    url: string,
    window: Electron.BrowserWindow,
  ) {
    if (url !== window.webContents.getURL()) {
      // this is a normal external redirect, open it in a new browser window
      event.preventDefault();
      shell.openExternal(url);
    }
  }

  private static isInternalUrl(url: string): boolean {
    return (
      url.startsWith('app://localhost') ||
      url.startsWith(`http://localhost:${rendererAppPort}`)
    );
  }

  private static isPopupUrl(url: string): boolean {
    try {
      const { pathname, hash } = new URL(url);
      // Supports both path-based (/popups/...) and hash-based (#/popups/...) routing
      return (
        pathname.startsWith('/popups/') ||
        hash.startsWith('#/popups/') ||
        hash.startsWith('#popups/')
      );
    } catch {
      return false;
    }
  }

  /**
   * `setWindowOpenHandler`'s `features` is the raw third argument passed to
   * the renderer's `window.open(url, '_blank', 'width=...,height=...')` —
   * parse it instead of guessing the size back out of the route, so each
   * `open*Popup` helper's own `window.open` call stays the single source of
   * truth for its window's size.
   */
  private static popupSizeFromFeatures(
    features: string,
  ): { width: number; height: number } {
    const parsed = new Map(
      features.split(',').map((entry): [string, string] => {
        const [key, value] = entry.split('=');
        return [key?.trim() ?? '', value?.trim() ?? ''];
      }),
    );
    const width = Number(parsed.get('width'));
    const height = Number(parsed.get('height'));
    return {
      width: width > 0 ? width : 900,
      height: height > 0 ? height : 700,
    };
  }

  private static onReady() {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    try {
      runMigration(App.application.getPath('userData'));
    } catch (error) {
      console.error('Workspace migration failed:', error);
    }

    if (rendererAppName) {
      App.loadNetworkStack();
      App.initWindow();
    }
  }

  private static initWindow() {
    if (rendererAppName) {
      App.initMainWindow();
      App.loadMainWindow();
    }
  }

  private static onActivate() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (App.mainWindow === null) {
      App.initWindow();
    }
  }

  private static loadNetworkStack() {
    const useDevServer = !App.application.isPackaged;

    protocol.handle('app', async (request) => {
      // Custom fetch
      if (useDevServer) {
        const externalRequest = new Request(
          request.url.replace('app://localhost', `http://localhost:${rendererAppPort}`),
          request
        );
        return await this.loadFromDevServer(externalRequest);
      } else {
        // The headless per-Workspace renderer (ADR-0011) is served from the
        // same `app://` origin as the main renderer under a `/headless`
        // path prefix, not a scheme of its own — OPFS is origin-scoped, so
        // the two renderers must share an origin or the headless one would
        // see an empty OPFS. Route by path instead.
        const { pathname, search } = new URL(request.url);
        if (pathname === '/headless' || pathname.startsWith('/headless/')) {
          const strippedRequest = new Request(
            `app://localhost${pathname.slice('/headless'.length) || '/'}${search}`,
            request,
          );
          return await this.loadFromDisk(strippedRequest, headlessRendererAppName);
        }
        return await this.loadFromDisk(request, rendererAppName);
      }
    });
  }

  private static loadFromDevServer(request: Request) {
    return fetch(request);
  }

  private static async loadFromDisk(request: Request, rendererAppRoot: string) {
    const rendererRoot = join(__dirname, '..', rendererAppRoot);
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

  private static createWindow(): Electron.BrowserWindow {
    const workAreaSize = screen.getPrimaryDisplay().workAreaSize;
    const width = Math.min(1280, workAreaSize.width || 1280);
    const height = Math.min(720, workAreaSize.height || 720);

    const additionalWebPreferences: Electron.WebPreferences = App.application
      .isPackaged
      ? { contextIsolation: true, sandbox: true, nodeIntegration: false }
      : { contextIsolation: true };

    // Create the browser window.
    const window = new BrowserWindow({
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
    window.setMenu(null);
    window.center();

    App.windows.push(window);

    window.on('enter-full-screen', () => {
      window.webContents.send('fullscreen-changed', true);
    });

    window.on('leave-full-screen', () => {
      window.webContents.send('fullscreen-changed', false);
    });

    window.once('ready-to-show', () => {
      console.log("ready to show");
      window.show();
    });

    // handle all external redirects in a new browser window
    window.webContents.on('will-navigate', (event, url) =>
      App.onRedirect(event, url, window),
    );

    window.webContents.on('did-create-window', (popupWindow) => {
      if (App.isDevelopmentMode()) {
        popupWindow.webContents.openDevTools();
      }
    });

    window.webContents.setWindowOpenHandler(({ url, features }) => {
      if (App.isInternalUrl(url) && App.isPopupUrl(url)) {
        const { width, height } = App.popupSizeFromFeatures(features);
        return {
          action: 'allow',
          overrideBrowserWindowOptions: {
            width,
            height,
            autoHideMenuBar: true,
            webPreferences: {
              contextIsolation: true,
              preload: join(__dirname, 'main.preload.js'),
            },
          },
        };
      }

      if (App.isInternalUrl(url)) {
        return { action: 'deny' };
      }

      shell.openExternal(url);
      return { action: 'deny' };
    });

    // Emitted when the window is closed.
    window.on('closed', () => {
      App.windows = App.windows.filter((w) => w !== window);
      forgetWindow(window.id);
      if (App.mainWindow === window) {
        // Promote another open window to "main", if any are left.
        App.mainWindow = App.windows[0] ?? null;
      }
    });

    // When the renderer crashes, destroy the stale window. If it was the
    // main window, open a fresh one so the app recovers cleanly instead of
    // being left with no windows and no way to get one back.
    window.webContents.on('render-process-gone', (_event, details) => {
      console.error('Renderer process gone:', details.reason);
      const wasMainWindow = App.mainWindow === window;
      window.destroy();
      App.windows = App.windows.filter((w) => w !== window);
      if (wasMainWindow) {
        App.mainWindow = App.windows[0] ?? null;
        if (!App.mainWindow) {
          App.initWindow();
        }
      }
    });

    return window;
  }

  private static initMainWindow() {
    App.setTheme('system');
    App.mainWindow = App.createWindow();

    App.mainWindow.once('ready-to-show', () => {
      const isDevMode =
        App.isDevelopmentMode() ||
        this.application.getVersion().includes('beta');
      Menu.setApplicationMenu(getMenu(isDevMode));
    });
  }

  /**
   * Opens an additional, independent window running the same renderer app.
   * Used by the "New Window" menu item, and by the workspace switcher when
   * the user chooses to open a workspace in a new window — `workspaceId`
   * is passed through the initial URL so the renderer boots directly into
   * that workspace instead of its last-active one.
   */
  static openNewWindow(workspaceId?: string) {
    const window = App.createWindow();
    App.loadWindow(window, workspaceId);
  }

  static setTheme(source: 'system' | 'dark' | 'light') {
    this.saveSetting('theme', source);
    nativeTheme.themeSource = source;
  }

  static getTheme() {
    return nativeTheme.themeSource;
  }

  private static loadMainWindow() {
    if (App.mainWindow) {
      App.loadWindow(App.mainWindow);
    }
  }

  private static loadWindow(
    window: Electron.BrowserWindow,
    workspaceId?: string,
  ) {
    // The renderer uses hash-based routing, so the workspace id rides on the
    // `:workspaceId` route segment (`#/<id>`) rather than a query param — see
    // ADR-0009.
    const hash = workspaceId ? `#/${encodeURIComponent(workspaceId)}` : '';

    // extensions do not work correctly with custom schemes
    // if we run locally, we need to use the http scheme
    if (!App.application.isPackaged) {
      window.loadURL(`http://localhost:${rendererAppPort}${hash}`);
      return;
    }

    window.loadURL(`app://localhost${hash}`);
  }

  private static saveSetting<T>(key: string, value: T) {
    const userData = App.application.getPath('userData');
    const settingsPath = path.join(userData, 'settings.json');

    let settings: Record<string, T> = {};
    if (fs.existsSync(settingsPath)) {
      settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    }

    settings[key] = value;

    fs.writeFileSync(settingsPath, JSON.stringify(settings), 'utf8');
  }

  private static getSetting<T>(key: string): T | undefined {
    const userData = App.application.getPath('userData');
    const settingsPath = path.join(userData, 'settings.json');

    let settings: Record<string, T> = {};
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
