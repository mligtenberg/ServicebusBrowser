import { App, app, BrowserWindow } from 'electron';
import { REDUX_DEVTOOLS } from 'electron-devtools-installer';
import installExtension from 'electron-devtools-installer';
import global from './global';
import { initSecretsHandler } from './handlers/secrets.handler';
import path from 'path';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

const isDev = process.argv.some((v) => v === 'dev');
const isNgServe = process.argv.some((v) => v === 'ngServe');

function createWindow(): BrowserWindow | null {
    // Create the browser window.
    let win: BrowserWindow | null = new BrowserWindow({
        width: 800,
        height: 600,
        minHeight: 420,
        minWidth: 620,
        icon: path.join(__dirname, '../build/icon.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: isDev
                ? path.join(__dirname, '../../electron-preload/dist/preload.bundled.js')
                : path.join(__dirname, '../preload/preload.bundled.js'),
            webSecurity: false,
        },
    });

    win.setMenu(null);

    if (isNgServe) {
        win.loadURL('http://localhost:4200');
    } else {
        // and load the index.html of the app.
        win.loadFile('../frontend/index.html');
    }

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });

    if (isDev) {
        win.webContents.openDevTools();
    }

    return win;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// Quit when all windows are closed.
app.on('window-all-closed', () => {
    app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
if (isDev) {
    app.whenReady().then(() => {
        installExtension(REDUX_DEVTOOLS)
            .then((name) => {
                console.log(`Added Extension:  ${name}`);
                initHandlers(app);
                if (global.currentWindow === null) {
                    global.currentWindow = createWindow();
                }
            })
            .catch((err) => console.log('An error occurred: ', err));
    });
} else {
    app.whenReady().then(() => {
        initHandlers(app);
        if (global.currentWindow === null) {
            global.currentWindow = createWindow();
        }
    });
}

function initHandlers(app: App) {
    initSecretsHandler(app);
}
