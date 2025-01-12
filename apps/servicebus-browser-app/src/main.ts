import SquirrelEvents from './app/events/squirrel.events';
import ElectronEvents from './app/events/electron.events';
import { app, BrowserWindow } from 'electron';
import App from './app/app';
import { installExtension, REDUX_DEVTOOLS } from 'electron-devtools-installer';
import ServiceBusEvents from './app/events/service-bus.events';
import UpdateEvents from './app/events/update.events';



export default class Main {
  static initialize() {
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
    if (!App.isDevelopmentMode()) {
      UpdateEvents.initAutoUpdateService();
    }
  }
}

// handle setup events as quickly as possible
Main.initialize();

// bootstrap app
Main.bootstrapApp();
Main.bootstrapAppEvents();

if (App.isDevelopmentMode()) {
  App.application.whenReady().then(() => {
    installExtension(REDUX_DEVTOOLS)
      .then((name) => console.log(`Added Extension:  ${name}`))
      .catch((err) => console.log('An error occurred: ', err));

    App.mainWindow.webContents.openDevTools();
  });
}
