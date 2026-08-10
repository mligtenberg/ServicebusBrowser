import type { Server as HttpServer } from 'http';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js';
import type { Request, Response } from 'express';
import { McpSettings } from '../events/secure-storage/mcp-settings';
import { registerTools } from './tools';

function methodNotAllowed(res: Response): void {
  res.writeHead(405).end(
    JSON.stringify({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Method not allowed.' },
      id: null,
    }),
  );
}

function unauthorized(res: Response): void {
  res.writeHead(401).end(
    JSON.stringify({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Unauthorized.' },
      id: null,
    }),
  );
}

/**
 * Owns the MCP server's HTTP listener lifecycle. Stateless per-request
 * transport (per the SDK's own recommended pattern for a server whose tools
 * just read/act on already-running app state) — there's no MCP session to
 * keep alive across requests.
 */
export class McpServerHost {
  private httpServer: HttpServer | undefined;

  isRunning(): boolean {
    return this.httpServer !== undefined;
  }

  async start(settings: McpSettings): Promise<void> {
    if (this.httpServer) {
      await this.stop();
    }

    const app = createMcpExpressApp({ host: '127.0.0.1' });

    const requireAuth = (req: Request, res: Response, next: () => void) => {
      const header = req.header('Authorization') ?? '';
      const expected = `Bearer ${settings.token}`;
      if (header !== expected) {
        unauthorized(res);
        return;
      }
      next();
    };

    app.post('/mcp', requireAuth, async (req, res) => {
      try {
        const mcpServer = new McpServer({
          name: 'servicebus-browser',
          version: '1.0.0',
        });
        registerTools(mcpServer);

        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: undefined,
        });
        await mcpServer.connect(transport);
        await transport.handleRequest(req, res, req.body);
        res.on('close', () => {
          transport.close();
          mcpServer.close();
        });
      } catch (error) {
        console.error('Error handling MCP request:', error);
        if (!res.headersSent) {
          res.status(500).json({
            jsonrpc: '2.0',
            error: { code: -32603, message: 'Internal server error' },
            id: null,
          });
        }
      }
    });

    app.get('/mcp', requireAuth, (_req, res) => methodNotAllowed(res));
    app.delete('/mcp', requireAuth, (_req, res) => methodNotAllowed(res));

    await new Promise<void>((resolve, reject) => {
      const server = app.listen(settings.port, '127.0.0.1');
      server.once('listening', () => {
        this.httpServer = server;
        resolve();
      });
      server.once('error', reject);
    });
  }

  async stop(): Promise<void> {
    const server = this.httpServer;
    if (!server) {
      return;
    }
    this.httpServer = undefined;
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

export const mcpServerHost = new McpServerHost();
