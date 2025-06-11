import { autoUpdater, dialog, MessageBoxOptions } from 'electron';
import { platform, arch } from 'os';
import { currentVersion, updateServerUrl } from '../constants';
import App from '../app';

export default class UpdateEvents {
  private static manualCheck = false;

  static setManualCheck(flag: boolean) {
    this.manualCheck = flag;
  }

  static wasManualCheck(): boolean {
    return this.manualCheck;
  }

  // initialize auto update service - most be invoked only in production
  static initAutoUpdateService() {
    const platform_arch =
      platform() === 'win32' ? platform() : platform() + '-' + arch();

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
  static checkForUpdates(manual = false) {
    if (!App.isDevelopmentMode() && autoUpdater.getFeedURL() !== '') {
      UpdateEvents.setManualCheck(manual);
      autoUpdater.checkForUpdates();
    }
  }
}

autoUpdater.on(
  'update-downloaded',
  (event, releaseNotes, releaseName, releaseDate) => {
    const dialogOpts: MessageBoxOptions = {
      type: 'info' as const,
      buttons: ['Restart', 'Later'],
      title: 'Application Update',
      message: process.platform === 'win32' ? releaseNotes : releaseName,
      detail:
        'A new version has been downloaded. Restart the application to apply the updates.',
    };

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) autoUpdater.quitAndInstall();
    });
    UpdateEvents.setManualCheck(false);
  }
);

autoUpdater.on('checking-for-update', () => {
  console.log('Checking for updates...\n');
});

autoUpdater.on('update-available', () => {
  console.log('New update available!\n');
  UpdateEvents.setManualCheck(false);
});

autoUpdater.on('update-not-available', () => {
  console.log('Up to date!\n');
  if (UpdateEvents.wasManualCheck()) {
    dialog.showMessageBox({
      type: 'info',
      buttons: ['OK'],
      title: 'Application Update',
      message: 'No updates were found.',
    });
    UpdateEvents.setManualCheck(false);
  }
});

autoUpdater.on('before-quit-for-update', () => {
  console.log('Application update is about to begin...\n');
});

autoUpdater.on('error', (message) => {
  console.error('There was a problem updating the application');
  console.error(message, '\n');
});
