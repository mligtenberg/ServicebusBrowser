import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { rendererAppPort } from '../constants';
import App from '../app';

const IDLE_TIMEOUT_MS = 5 * 60 * 1000;

type HeadlessChannel =
  | 'headless:list-pages'
  | 'headless:describe-page'
  | 'headless:run-query'
  | 'headless:get-message';

interface HeadlessEntry {
  window: BrowserWindow;
  ready: Promise<void>;
  idleTimer: NodeJS.Timeout;
}

// One hidden renderer per Workspace (ADR-0011) — a query for a different
// Workspace gets its own window rather than an existing one switching
// context. Torn down after 5 minutes of no queries.
const windows = new Map<string, HeadlessEntry>();
let requestCounter = 0;

function scheduleIdleTeardown(workspaceId: string, entry: HeadlessEntry): void {
  clearTimeout(entry.idleTimer);
  entry.idleTimer = setTimeout(() => {
    if (windows.get(workspaceId) === entry) {
      windows.delete(workspaceId);
      if (!entry.window.isDestroyed()) {
        entry.window.destroy();
      }
    }
  }, IDLE_TIMEOUT_MS);
}

function waitForReady(window: BrowserWindow): Promise<void> {
  return new Promise((resolve) => {
    const handler = (event: Electron.IpcMainEvent) => {
      if (event.sender.id === window.webContents.id) {
        ipcMain.removeListener('headless:ready', handler);
        resolve();
      }
    };
    ipcMain.on('headless:ready', handler);
  });
}

function createEntry(workspaceId: string): HeadlessEntry {
  // In development, show this window and open its DevTools console instead
  // of hiding it — there's otherwise no way to see this renderer's logs
  // (OPFS errors, query failures) since it never appears in the dock/taskbar
  // the way a normal window would. Packaged builds keep it hidden.
  const isDev = App.isDevelopmentMode();

  const window = new BrowserWindow({
    show: isDev,
    webPreferences: {
      contextIsolation: true,
      backgroundThrottling: false,
      preload: join(__dirname, 'main.preload.js'),
    },
  });
  window.setTitle(`Servicebus Browser — MCP headless renderer (${workspaceId})`);

  // Served under /headless on the *same origin* as the main renderer
  // (proxied to the headless dev server in dev, routed by path in
  // `app.ts`'s `app://` protocol handler in packaged builds) — OPFS is
  // origin-scoped, so this renderer must share an origin with the visible
  // one to see the Message Page databases it wrote.
  const query = `?workspaceId=${encodeURIComponent(workspaceId)}`;
  if (!app.isPackaged) {
    window.loadURL(`http://localhost:${rendererAppPort}/headless/${query}`);
  } else {
    window.loadURL(`app://localhost/headless/${query}`);
  }

  if (isDev) {
    window.webContents.openDevTools({ mode: 'detach' });
  }

  const entry: HeadlessEntry = {
    window,
    ready: waitForReady(window),
    idleTimer: setTimeout(() => undefined, 0),
  };
  scheduleIdleTeardown(workspaceId, entry);

  window.webContents.once('destroyed', () => {
    if (windows.get(workspaceId) === entry) {
      clearTimeout(entry.idleTimer);
      windows.delete(workspaceId);
    }
  });

  return entry;
}

async function getEntry(workspaceId: string): Promise<HeadlessEntry> {
  let entry = windows.get(workspaceId);
  if (!entry || entry.window.isDestroyed()) {
    entry = createEntry(workspaceId);
    windows.set(workspaceId, entry);
  } else {
    scheduleIdleTeardown(workspaceId, entry);
  }
  await entry.ready;
  return entry;
}

function rpc<T>(
  window: BrowserWindow,
  channel: HeadlessChannel,
  payload: Record<string, unknown>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const requestId = `${channel}:${window.webContents.id}:${++requestCounter}`;
    const responseChannel = `headless:response:${requestId}`;

    const timeout = setTimeout(() => {
      ipcMain.removeAllListeners(responseChannel);
      reject(new Error('Headless renderer did not respond in time.'));
    }, 20_000);

    ipcMain.once(responseChannel, (_event, result: { data?: T; error?: string }) => {
      clearTimeout(timeout);
      if (result.error) {
        reject(new Error(result.error));
      } else {
        resolve(result.data as T);
      }
    });

    window.webContents.send(channel, { requestId, ...payload });
  });
}

/**
 * Gets (or lazily creates) the hidden per-Workspace renderer backing the MCP
 * Message Page query tools (ADR-0011/0012), and runs one request-response RPC
 * against it. Resets that Workspace's 5-minute idle timeout on every call.
 */
export async function runHeadlessRequest<T>(
  workspaceId: string,
  channel: HeadlessChannel,
  payload: Record<string, unknown> = {},
): Promise<T> {
  const entry = await getEntry(workspaceId);
  scheduleIdleTeardown(workspaceId, entry);
  return rpc<T>(entry.window, channel, payload);
}
