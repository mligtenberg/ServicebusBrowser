import path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

export interface McpSettings {
  enabled: boolean;
  port: number;
  token: string;
}

const DEFAULT_PORT = 41823;

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Persisted locally in plaintext, unlike connection credentials: the token
 * only protects a loopback (127.0.0.1) HTTP server, not a remote credential.
 */
export class McpSettingsStorage {
  private readonly settingsPath: string;

  constructor(userDataMainFolder: string) {
    this.settingsPath = path.join(userDataMainFolder, 'sbb-mcp-settings.json');
  }

  read(): McpSettings {
    if (!fs.existsSync(this.settingsPath)) {
      return { enabled: false, port: DEFAULT_PORT, token: generateToken() };
    }
    const parsed = JSON.parse(fs.readFileSync(this.settingsPath, 'utf8'));
    return {
      enabled: parsed.enabled ?? false,
      port: parsed.port ?? DEFAULT_PORT,
      token: parsed.token ?? generateToken(),
    };
  }

  private write(settings: McpSettings): void {
    fs.writeFileSync(this.settingsPath, JSON.stringify(settings), 'utf8');
  }

  setEnabled(enabled: boolean): McpSettings {
    const current = this.read();
    const updated = { ...current, enabled };
    this.write(updated);
    return updated;
  }

  setPort(port: number): McpSettings {
    const current = this.read();
    const updated = { ...current, port };
    this.write(updated);
    return updated;
  }

  regenerateToken(): McpSettings {
    const current = this.read();
    const updated = { ...current, token: generateToken() };
    this.write(updated);
    return updated;
  }
}
