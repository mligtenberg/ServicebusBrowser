import { Component, effect, inject } from '@angular/core';
import { MainUiComponent } from '@service-bus-browser/main-ui';
import { ColorThemeService } from '@service-bus-browser/services';

interface ElectronWindow {
  electron?: {
    platform?: string;
    onFullScreenChanged?: (callback: (fullscreen: boolean) => void) => void;
    checkForUpdates?: () => Promise<void>;
  };
}

@Component({
  imports: [
    MainUiComponent
  ],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'servicebus-browser-frontend';
  private electron = (window as unknown as ElectronWindow).electron;
  isMac = this.electron?.platform === 'darwin';

  themeService = inject(ColorThemeService);
  darkMode = this.themeService.darkMode;

  constructor() {
    this.setDarkMode(this.darkMode());
    effect(() => this.setDarkMode(this.darkMode()));
    this.electron?.onFullScreenChanged?.((full) => {
      document.body.classList.toggle('fullscreen', full);
    });
  }

  setDarkMode(darkMode: boolean) {
    const element = document.querySelector('html');
    const darkModeSet = element?.classList.contains('darkMode');
    if (darkMode && !darkModeSet) {
      element?.classList.add('darkMode');
    }

    if (!darkMode && darkModeSet) {
      element?.classList.remove('darkMode');
    }
  }
}
