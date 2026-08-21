import { ipcMain } from 'electron';
import App from '../app';
import { McpSettings, McpSettingsStorage } from './secure-storage/mcp-settings';
import { mcpServerHost } from '../mcp/mcp-server';

let storage: McpSettingsStorage | undefined;

async function applySettings(settings: McpSettings): Promise<void> {
  App.setMcpEnabled(settings.enabled);

  if (settings.enabled) {
    await mcpServerHost.start(settings);
  } else {
    await mcpServerHost.stop();
  }
}

async function regenerateToken(): Promise<McpSettings> {
  const settings = storage!.regenerateToken();
  await applySettings(settings);
  return settings;
}

function clientConfigSnippet(settings: McpSettings): string {
  return JSON.stringify(
    {
      mcpServers: {
        'servicebus-browser': {
          url: `http://127.0.0.1:${settings.port}/mcp`,
          headers: { Authorization: `Bearer ${settings.token}` },
        },
      },
    },
    null,
    2,
  );
}

export default class McpEvents {
  static async bootstrapMcpEvents(): Promise<void> {
    storage = new McpSettingsStorage(App.application.getPath('userData'));
    await applySettings(storage.read());
  }
}

ipcMain.handle('mcp:get-status', () => {
  const settings = storage!.read();
  return { ...settings, clientConfigSnippet: clientConfigSnippet(settings) };
});

ipcMain.handle('mcp:set-enabled', async (_event, enabled: boolean) => {
  const settings = storage!.setEnabled(enabled);
  await applySettings(settings);
  return { ...settings, clientConfigSnippet: clientConfigSnippet(settings) };
});

ipcMain.handle('mcp:set-port', async (_event, port: number) => {
  const settings = storage!.setPort(port);
  await applySettings(settings);
  return { ...settings, clientConfigSnippet: clientConfigSnippet(settings) };
});

ipcMain.handle('mcp:regenerate-token', async () => {
  const settings = await regenerateToken();
  return { ...settings, clientConfigSnippet: clientConfigSnippet(settings) };
});
