import { computed, effect, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ColorThemeService {
  private readonly storageKey = 'color-theme-preference';

  private osMode = signal<'light' | 'dark'>('light');
  private userPreference = signal<'sync' | 'light' | 'dark'>('sync');

  /**
   * The current effective mode taking the user preference into account.
   */
  mode = computed<'light' | 'dark'>(() => {
    const pref = this.userPreference();
    if (pref === 'sync') {
      return this.osMode();
    }
    return pref;
  });

  darkMode = computed(() => this.mode() === 'dark');
  lightMode = computed(() => this.mode() === 'light');

  constructor() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored === 'light' || stored === 'dark' || stored === 'sync') {
      this.userPreference.set(stored);
    }

    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.osMode.set(darkModeMediaQuery.matches ? 'dark' : 'light');

    darkModeMediaQuery.addEventListener('change', (e) => {
      this.osMode.set(e.matches ? 'dark' : 'light');
    });

    effect(() => {
      localStorage.setItem(this.storageKey, this.userPreference());
    });
  }

  setPreference(pref: 'sync' | 'light' | 'dark') {
    this.userPreference.set(pref);
  }

  preference() {
    return this.userPreference();
  }
}
