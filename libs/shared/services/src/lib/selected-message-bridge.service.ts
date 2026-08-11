import { Injectable } from '@angular/core';

interface ElectronWindow {
  electron?: {
    reportSelectedMessage?: (messageKey: string | null) => void;
  };
}

/**
 * Pushes the message key currently selected in a Message Page grid to the
 * Electron main process, backing the `get_selected_message` MCP tool (main
 * has no other way to observe a window's live grid selection). A no-op
 * everywhere the `electron` bridge isn't present (e.g. the web frontend),
 * same pattern as `WorkspaceWindowService`'s optional-chained calls.
 */
@Injectable({ providedIn: 'root' })
export class SelectedMessageBridgeService {
  private readonly electron = (window as unknown as ElectronWindow).electron;

  reportSelectedMessage(messageKey: string | null): void {
    this.electron?.reportSelectedMessage?.(messageKey);
  }
}
