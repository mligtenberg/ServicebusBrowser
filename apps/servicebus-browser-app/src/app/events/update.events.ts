import { autoUpdater, dialog, MessageBoxOptions, BrowserWindow } from 'electron';
import { marked } from 'marked';
import { platform, arch } from 'os';
import { currentVersion, updateServerUrl } from '../constants';
import App from '../app';

export default class UpdateEvents {
  // initialize auto update service - most be invoked only in production
  static initAutoUpdateService() {
    const platform_arch =
      platform() === 'win32' ? platform() : platform() + "-" + arch();

    const feed: Electron.FeedURLOptions = {
      url: `${updateServerUrl}/mligtenberg/ServicebusBrowser/${platform_arch}/${currentVersion}`,
    };


    if (!App.isDevelopmentMode()) {
      console.log('Initializing auto update service...\n');

      autoUpdater.setFeedURL(feed);
      UpdateEvents.checkForUpdates();
    }
  }

  // check for updates - most be invoked after initAutoUpdateService() and only in production
  static checkForUpdates() {
    if (!App.isDevelopmentMode() && autoUpdater.getFeedURL() !== '') {
      autoUpdater.checkForUpdates();
    }
  }

  private static async showReleaseNotes(title: string, notes: string) {
    const win = new BrowserWindow({
      width: 600,
      height: 500,
      modal: true,
      parent: App.mainWindow,
      show: false,
      title,
      webPreferences: { nodeIntegration: false }
    });
    const html = `<html><head><meta charset="UTF-8"><style>body{font-family:sans-serif;padding:20px;}</style></head><body>${marked.parse(notes)}</body></html>`;
    win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
    await new Promise((resolve) => {
      win.once('ready-to-show', () => win.show());
      win.on('closed', () => resolve(null));
    });
  }
}

autoUpdater.on(
  'update-downloaded',
  (event, releaseNotes, releaseName) => {
    if (App.mainWindow) {
      App.mainWindow.setProgressBar(-1);
    }
    const dialogOpts: MessageBoxOptions = {
      type: 'info' as const,
      buttons: ['Restart', 'Later'],
      title: 'Application Update',
      message: releaseName,
      detail:
        'A new version has been downloaded. Restart the application to apply the updates.',
    };

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) autoUpdater.quitAndInstall();
    });
  }
);

autoUpdater.on('checking-for-update', () => {
  console.log('Checking for updates...\n');
});

autoUpdater.on('update-available', async (_event, info) => {
  console.log('New update available!\n');

  let notes = '';
  if (Array.isArray(info.releaseNotes)) {
    notes = info.releaseNotes.map((n) => n.note).join('\n');
  } else if (info.releaseNotes) {
    notes = info.releaseNotes;
  }

  await UpdateEvents.showReleaseNotes(
    info.releaseName ?? info.version ?? 'Update available',
    notes
  );

  const { response } = await dialog.showMessageBox({
    type: 'info',
    buttons: ['Download', 'Later'],
    title: 'Update Available',
    message: info.releaseName ?? info.version ?? 'Update available',
    detail: notes,
  });

  if (response === 0) {
    autoUpdater.downloadUpdate();
  }
});

autoUpdater.on('download-progress', (progressObj) => {
  console.log(
    `Downloading update... ${Math.round(progressObj.percent)}%`
  );
  if (App.mainWindow) {
    App.mainWindow.setProgressBar(progressObj.percent / 100);
  }
});

autoUpdater.on('update-not-available', () => {
  console.log('Up to date!\n');
  dialog.showMessageBox({
    type: 'info',
    buttons: ['OK'],
    title: 'No Updates',
    message: 'You are running the latest version.'
  });
});

autoUpdater.on('before-quit-for-update', () => {
  console.log('Application update is about to begin...\n');
});

autoUpdater.on('error', (message) => {
  console.error('There was a problem updating the application');
  console.error(message, '\n');
});
