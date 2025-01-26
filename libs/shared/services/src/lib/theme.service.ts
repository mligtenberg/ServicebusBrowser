import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ColorThemeService {
  private internalMode = signal<'light' | 'dark'>('light');
  mode = computed(() => this.internalMode());
  darkMode = computed(() => this.mode() === 'dark');
  lightMode = computed(() => this.mode() === 'light');

  constructor() {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    this.internalMode.set(darkModeMediaQuery.matches ? 'dark' : 'light');

    darkModeMediaQuery.addEventListener('change', (e) => {
      this.internalMode.set(e.matches ? 'dark' : 'light');
    });
  }
}
