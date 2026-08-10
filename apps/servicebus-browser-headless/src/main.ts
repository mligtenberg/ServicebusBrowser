import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

try {
  await bootstrapApplication(App, appConfig);
} catch (err) {
  console.error('Failed to bootstrap headless renderer:', err);
}
