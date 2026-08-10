import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  SbbButton,
  SbbCheckbox,
  SbbInputNumber,
  SbbTextarea,
} from '@service-bus-browser/shared-ui';

interface McpStatus {
  enabled: boolean;
  port: number;
  token: string;
  clientConfigSnippet: string;
}

interface McpWindow {
  mcpApi?: {
    getStatus: () => Promise<McpStatus>;
    setEnabled: (enabled: boolean) => Promise<McpStatus>;
    setPort: (port: number) => Promise<McpStatus>;
    regenerateToken: () => Promise<McpStatus>;
  };
}

/**
 * Standalone popup window (ADR-0008 pattern) for enabling the MCP server
 * (ADR-0010) and copying its client config snippet. A separate window like
 * the connection/workspace popups, not an in-app modal.
 */
@Component({
  selector: 'app-mcp-settings-popup',
  imports: [FormsModule, SbbButton, SbbCheckbox, SbbInputNumber, SbbTextarea],
  templateUrl: './mcp-settings-popup.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './mcp-settings-popup.scss',
})
export class McpSettingsPopupComponent {
  private readonly mcpApi = (window as unknown as McpWindow).mcpApi;

  enabled = signal(false);
  port = signal(0);
  snippet = signal('');
  loading = signal(true);
  busy = signal(false);
  copied = signal(false);

  constructor() {
    void this.refresh();
  }

  private async refresh(): Promise<void> {
    const status = await this.mcpApi?.getStatus();
    if (status) {
      this.enabled.set(status.enabled);
      this.port.set(status.port);
      this.snippet.set(status.clientConfigSnippet);
    }
    this.loading.set(false);
  }

  async toggleEnabled(enabled: boolean): Promise<void> {
    this.busy.set(true);
    try {
      const status = await this.mcpApi?.setEnabled(enabled);
      if (status) {
        this.enabled.set(status.enabled);
        this.snippet.set(status.clientConfigSnippet);
      }
    } finally {
      this.busy.set(false);
    }
  }

  async savePort(port: number): Promise<void> {
    if (!port || port === this.port()) return;
    this.busy.set(true);
    try {
      const status = await this.mcpApi?.setPort(port);
      if (status) {
        this.port.set(status.port);
        this.snippet.set(status.clientConfigSnippet);
      }
    } finally {
      this.busy.set(false);
    }
  }

  async regenerateToken(): Promise<void> {
    this.busy.set(true);
    try {
      const status = await this.mcpApi?.regenerateToken();
      if (status) {
        this.snippet.set(status.clientConfigSnippet);
      }
    } finally {
      this.busy.set(false);
    }
  }

  async copySnippet(): Promise<void> {
    await navigator.clipboard.writeText(this.snippet());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1500);
  }

  close(): void {
    window.close();
  }
}
