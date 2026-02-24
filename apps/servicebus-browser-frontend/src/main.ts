import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

if (navigator.storage && navigator.storage.persist) {
  const persistent = await navigator.storage.persist();

  if (persistent) {
    console.log('Storage will not be cleared except by explicit user action');
  } else {
    console.log('Storage may be cleared by the UA under storage pressure.');
  }
}


bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
