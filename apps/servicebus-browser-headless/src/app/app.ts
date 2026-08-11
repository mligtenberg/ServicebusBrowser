import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { UUID } from '@service-bus-browser/shared-contracts';
import {
  describeMessagePage,
  getMessagesRepository,
  initializeWorkspace,
  migrateOpfsFiles,
  queryMessagePageReadOnly,
} from '@service-bus-browser/messages-db';

interface HeadlessRequest {
  requestId: string;
  pageId?: string;
  sql?: string;
  messageKey?: string;
}

interface HeadlessResponse {
  data?: unknown;
  error?: string;
}

interface HeadlessBridge {
  onListPages: (callback: (request: HeadlessRequest) => void) => void;
  onDescribePage: (callback: (request: HeadlessRequest) => void) => void;
  onRunQuery: (callback: (request: HeadlessRequest) => void) => void;
  onGetMessage: (callback: (request: HeadlessRequest) => void) => void;
  respond: (requestId: string, result: HeadlessResponse) => void;
  notifyReady: () => void;
}

interface LogEntry {
  requestId: string;
  channel: string;
  request: HeadlessRequest;
  requestedAt: string;
  response?: HeadlessResponse;
  respondedAt?: string;
}

const MAX_LOG_ENTRIES = 20;

/**
 * Root (and only) component of the headless per-Workspace renderer (ADR-0011).
 * Never shown in packaged builds — its job is purely to get OPFS/messages-db
 * access to a fixed Workspace's Message Page databases and answer MCP
 * query-tool RPCs sent from the Electron main process (ADR-0012).
 * Deliberately skips the NgRx store/router/topology machinery the visible
 * app needs: none of that is required to read a Message Page's SQLite file
 * directly. The template below only matters in development, where
 * `headless-window-manager.ts` shows this window instead of hiding it —
 * it's the only way to see what the MCP tools have been asking for.
 */
@Component({
  selector: 'app-root',
  imports: [JsonPipe],
  template: `
    <main>
      <h1>Headless renderer — last {{ MAX_LOG_ENTRIES }} calls</h1>
      @for (entry of log(); track entry.requestId) {
        <section class="entry" [class.pending]="!entry.response">
          <header>
            <span class="channel">{{ entry.channel }}</span>
            <span class="time">{{ entry.requestedAt }}</span>
          </header>
          <pre class="request">{{ entry.request | json }}</pre>
          @if (entry.response) {
            <pre class="response" [class.error]="entry.response.error">{{ entry.response | json }}</pre>
          } @else {
            <p class="response pending">pending…</p>
          }
        </section>
      } @empty {
        <p>No calls received yet.</p>
      }
    </main>
  `,
  styles: `
    :host {
      display: block;
      font-family: monospace;
      font-size: 12px;
      color: #ddd;
      background: #1e1e1e;
      min-height: 100vh;
      padding: 12px;
      box-sizing: border-box;
    }
    h1 {
      font-size: 14px;
      margin: 0 0 12px;
    }
    .entry {
      border: 1px solid #444;
      border-radius: 4px;
      padding: 8px;
      margin-bottom: 8px;
    }
    .entry.pending {
      border-color: #b58900;
    }
    header {
      display: flex;
      justify-content: space-between;
      color: #888;
      margin-bottom: 4px;
    }
    .channel {
      color: #7ec5ff;
    }
    pre {
      margin: 0;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .response.error {
      color: #ff6b6b;
    }
    .response.pending {
      color: #b58900;
    }
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class App {
  readonly MAX_LOG_ENTRIES = MAX_LOG_ENTRIES;
  readonly log = signal<LogEntry[]>([]);

  constructor() {
    void this.bootstrap();
  }

  private async bootstrap(): Promise<void> {
    const workspaceId = new URLSearchParams(window.location.search).get(
      'workspaceId',
    ) as UUID | null;
    if (!workspaceId) {
      console.error('Headless renderer loaded with no workspaceId query param.');
      return;
    }

    try {
      await migrateOpfsFiles(workspaceId);
    } catch (err) {
      console.warn('OPFS migration failed; will retry on next boot:', err);
    }
    initializeWorkspace(workspaceId);
    const repository = await getMessagesRepository();

    const bridge = (window as unknown as { headlessApi: HeadlessBridge }).headlessApi;

    bridge.onListPages((request) =>
      this.respond(bridge, 'headless:list-pages', request, () =>
        repository.getPages(),
      ),
    );

    bridge.onDescribePage((request) =>
      this.respond(bridge, 'headless:describe-page', request, () =>
        describeMessagePage(repository, workspaceId, request.pageId as UUID),
      ),
    );

    bridge.onRunQuery((request) =>
      this.respond(bridge, 'headless:run-query', request, () =>
        queryMessagePageReadOnly(
          workspaceId,
          request.pageId as UUID,
          request.sql as string,
        ),
      ),
    );

    bridge.onGetMessage((request) =>
      this.respond(bridge, 'headless:get-message', request, () =>
        repository.getMessage(request.pageId as UUID, request.messageKey as string),
      ),
    );

    bridge.notifyReady();
  }

  private async respond(
    bridge: HeadlessBridge,
    channel: string,
    request: HeadlessRequest,
    run: () => Promise<unknown>,
  ): Promise<void> {
    this.recordRequest(channel, request);

    let response: HeadlessResponse;
    try {
      response = { data: await run() };
    } catch (err) {
      response = { error: err instanceof Error ? err.message : String(err) };
    }
    bridge.respond(request.requestId, response);
    this.recordResponse(request.requestId, response);
  }

  private recordRequest(channel: string, request: HeadlessRequest): void {
    const entry: LogEntry = {
      requestId: request.requestId,
      channel,
      request,
      requestedAt: new Date().toISOString(),
    };
    this.log.update((entries) => [entry, ...entries].slice(0, MAX_LOG_ENTRIES));
  }

  private recordResponse(requestId: string, response: HeadlessResponse): void {
    this.log.update((entries) =>
      entries.map((entry) =>
        entry.requestId === requestId
          ? { ...entry, response, respondedAt: new Date().toISOString() }
          : entry,
      ),
    );
  }
}
