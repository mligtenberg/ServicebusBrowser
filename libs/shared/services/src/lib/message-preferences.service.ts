import { effect, Injectable, signal } from '@angular/core';

export type BodyViewMode = 'raw' | 'pretty';

@Injectable({
  providedIn: 'root',
})
export class MessagePreferencesService {
  private readonly storageKey = 'message-preferences.default-body-view';

  private readonly _defaultBodyView = signal<BodyViewMode>('raw');
  readonly defaultBodyView = this._defaultBodyView.asReadonly();

  constructor() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored === 'raw' || stored === 'pretty') {
      this._defaultBodyView.set(stored);
    }

    effect(() => {
      localStorage.setItem(this.storageKey, this._defaultBodyView());
    });
  }

  setDefaultBodyView(mode: BodyViewMode): void {
    this._defaultBodyView.set(mode);
  }
}
