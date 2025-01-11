import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);

window.addEventListener('beforeunload', (e) => {
  // Prevent the default behavior of reloading
  e.preventDefault();
});
