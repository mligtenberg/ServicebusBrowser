import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { initializeClientConfig } from './app/client-config-loader';

initializeClientConfig().then(() => {
  bootstrapApplication(App, appConfig).catch((err) => console.error(err));
});
