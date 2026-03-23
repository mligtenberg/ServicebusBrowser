import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { registerCustomIcons } from '@service-bus-browser/custom-icons';

if (navigator.storage && navigator.storage.persist) {
  const persistent = await navigator.storage.persist();

  if (persistent) {
    console.log('Storage will not be cleared except by explicit user action');
  } else {
    console.log('Storage may be cleared by the UA under storage pressure.');
  }
}

registerCustomIcons();

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
