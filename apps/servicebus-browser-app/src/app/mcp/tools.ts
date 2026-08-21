import { z } from 'zod';
import { BrowserWindow } from 'electron';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ReceivedMessage, TopologyNode } from '@service-bus-browser/api-contracts';
import { MessageFilter, PropertyFilter } from '@service-bus-browser/filtering';
import App from '../app';
import { getServer } from '../events/service-bus.events';
import { getWorkspacesServer } from '../events/workspace.events';
import {
  findWindowForWorkspace,
  getActiveWindow,
  getOpenWorkspaceIds,
} from '../events/workspace-window-registry';
import { runHeadlessRequest } from './headless-window-manager';
import {
  getActivePage,
  getActivePageFilterFor,
  getActiveWorkspaceId,
  getSelectedMessageRef,
} from './active-page';

function json(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

function error(message: string) {
  return { content: [{ type: 'text' as const, text: message }], isError: true };
}

/**
 * Every command an MCP tool asks a renderer window to act on, sent over a
 * single `mcp:command` IPC channel and dispatched with one `main.preload.ts`
 * bridge method / one `main-shell.ts` listener (a switch on `type`) — adding
 * a new renderer-mutating tool means adding one variant here instead of a
 * new channel + bridge method + listener each time.
 */
type McpCommand =
  | { type: 'navigate-to-topology-path'; path: string }
  | { type: 'open-message-page'; workspaceId: string; pageId: string }
  | { type: 'set-active-page-filter'; filter: MessageFilter };

/**
 * Returns whether the command was actually sent. `set_active_page_filter`
 * awaits a `describe_message_page` round trip (for fieldName validation)
 * between resolving `window` and calling this — long enough for the user to
 * close that window in the meantime. `.send()` on a destroyed `webContents`
 * doesn't throw somewhere our own try/catch can see it; Electron logs it via
 * an internal `console.error` instead, which can itself crash the process if
 * stdout/stderr has no reader (an uncaught EPIPE — see `main.ts`'s guard).
 * Checking `isDestroyed()` first avoids ever reaching that path.
 */
function sendCommand(window: BrowserWindow, command: McpCommand): boolean {
  if (window.isDestroyed()) {
    return false;
  }
  window.webContents.send('mcp:command', command);
  return true;
}

/**
 * The 5 EAV property tables `set_active_page_filter`'s `headers` /
 * `properties` / `deliveryAnnotations` / `messageAnnotations` /
 * `applicationProperties` arrays target — the exact same table names
 * `describe_message_page`'s `propertyTables` reports labels for. Shared so
 * both tools' descriptions and the runtime validation below stay in sync if
 * a table is ever added.
 */
const PROPERTY_TABLES = [
  'headers',
  'properties',
  'deliveryAnnotations',
  'messageAnnotations',
  'applicationProperties',
] as const;

const fieldNameDescription =
  "A property name/label seen on this Message Page for this table — call describe_message_page first and use one of that table's propertyTables[].labels[].label entries. A fieldName from the wrong table (e.g. a `properties` label passed under `headers`) matches nothing and silently returns zero results, so set_active_page_filter validates it against the page's actual labels and errors out with the right table if it's misplaced.";

/**
 * Mirrors `MessageFilter` (`@service-bus-browser/filtering`) as a zod schema
 * for `set_active_page_filter`'s `inputSchema` — the same shape the UI's
 * filter builder produces, so tool callers can pass exactly what
 * `query_message_page`/`describe_message_page` or prior UI usage already
 * shaped for them. `DateFilter.value` is `Date` in `MessageFilter`, but a
 * `Date` output type can't be represented in JSON Schema (the SDK errors
 * converting the tool's `inputSchema` at call time) — so the wire schema
 * keeps it as an ISO string and `toMessageFilter()` below converts it to a
 * `Date` afterwards, the same way `JSON.parse` + a manual revive would.
 */
const propertyFilterSchema = z.discriminatedUnion('fieldType', [
  z.object({
    fieldName: z.string().describe(fieldNameDescription),
    isActive: z.boolean(),
    fieldType: z.literal('string'),
    filterType: z.enum(['contains', 'equals', 'regex', 'notequals', 'notcontains', 'notregex']),
    value: z.string(),
  }),
  z.object({
    fieldName: z.string().describe(fieldNameDescription),
    isActive: z.boolean(),
    fieldType: z.literal('date'),
    filterType: z.enum(['before', 'after', 'equals', 'notequals']),
    value: z.string().describe('An ISO 8601 date/time string'),
  }),
  z.object({
    fieldName: z.string().describe(fieldNameDescription),
    isActive: z.boolean(),
    fieldType: z.literal('number'),
    filterType: z.enum(['greater', 'less', 'equals', 'notequals']),
    value: z.number(),
  }),
  z.object({
    fieldName: z.string().describe(fieldNameDescription),
    isActive: z.boolean(),
    fieldType: z.literal('boolean'),
    filterType: z.literal('equals'),
    value: z.boolean(),
  }),
  z.object({
    fieldName: z.string().describe(fieldNameDescription),
    isActive: z.boolean(),
    fieldType: z.literal('timespan'),
    filterType: z.enum(['greater', 'less', 'equals', 'notequals']),
    value: z.string(),
  }),
]);
type WirePropertyFilter = z.infer<typeof propertyFilterSchema>;

const bodyFilterSchema = z.object({
  isActive: z.boolean(),
  filterType: z.enum(['contains', 'regex', 'equals', 'notcontains', 'notregex', 'notequals']),
  value: z.string(),
});

const messageFilterSchema = z.object({
  headers: z
    .array(propertyFilterSchema)
    .default([])
    .describe("Filters on the `headers` EAV table's labels (e.g. delivery-count)."),
  deliveryAnnotations: z
    .array(propertyFilterSchema)
    .default([])
    .describe("Filters on the `deliveryAnnotations` EAV table's labels."),
  messageAnnotations: z
    .array(propertyFilterSchema)
    .default([])
    .describe(
      "Filters on the `messageAnnotations` EAV table's labels (e.g. x-opt-enqueued-time, x-opt-sequence-number).",
    ),
  properties: z
    .array(propertyFilterSchema)
    .default([])
    .describe(
      "Filters on the `properties` EAV table's labels — AMQP message properties such as message-id, subject, content-type. NOT the same as the `messages.contentType` SQL column reported by describe_message_page/query_message_page; that fixed column has no filter here — use query_message_page for it.",
    ),
  applicationProperties: z
    .array(propertyFilterSchema)
    .default([])
    .describe("Filters on the `applicationProperties` EAV table's labels — app-defined custom properties."),
  body: z
    .array(bodyFilterSchema)
    .default([])
    .describe(
      "Filters directly on each message's raw body text — no fieldName, since there's only one body per message. Use this for 'body contains X' / 'body matches this regex' requests, including detecting CSV-shaped bodies (e.g. a regex like '^[^,\\n]+(,[^,\\n]+)+' matching a comma-separated line).",
    ),
});

function toPropertyFilter(wire: WirePropertyFilter): PropertyFilter {
  return wire.fieldType === 'date' ? { ...wire, value: new Date(wire.value) } : wire;
}

function toMessageFilter(wire: z.infer<typeof messageFilterSchema>): MessageFilter {
  return {
    headers: wire.headers.map(toPropertyFilter),
    deliveryAnnotations: wire.deliveryAnnotations.map(toPropertyFilter),
    messageAnnotations: wire.messageAnnotations.map(toPropertyFilter),
    properties: wire.properties.map(toPropertyFilter),
    applicationProperties: wire.applicationProperties.map(toPropertyFilter),
    body: wire.body,
  };
}

/**
 * Just the slice of `describe_message_page`'s `MessagePageSchema`
 * (`@service-bus-browser/messages-db`) that `findUnknownFieldNames` needs —
 * declared locally rather than imported so this main-process bundle doesn't
 * pull in that library's browser-only sqlite-wasm renderer code merely for
 * a type (even `import type` didn't get elided from the webpack build here).
 */
interface MessagePageLabels {
  propertyTables: { table: string; labels: { label: string; type: string }[] }[];
}

/**
 * A `fieldName` under the wrong table (a `properties` label passed under
 * `headers`, say) doesn't fail — it just matches nothing, so the caller gets
 * a silent, wrong "success" with no signal that anything's off (see
 * docs/mcp-server.md's `set_active_page_filter` entry for the incident this
 * caught). Checked against the page's real labels from `describe_message_page`
 * before the filter is ever sent to the renderer, so a misplaced fieldName
 * fails loudly with the table it actually belongs to instead.
 */
function findUnknownFieldNames(
  wire: z.infer<typeof messageFilterSchema>,
  schema: MessagePageLabels,
): string[] {
  const labelsByTable = new Map(
    schema.propertyTables.map(({ table, labels }) => [table, new Set(labels.map((l) => l.label))]),
  );
  const problems: string[] = [];
  for (const table of PROPERTY_TABLES) {
    for (const { fieldName } of wire[table]) {
      if (labelsByTable.get(table)?.has(fieldName)) {
        continue;
      }
      const actualTable = PROPERTY_TABLES.find((t) => labelsByTable.get(t)?.has(fieldName));
      problems.push(
        actualTable
          ? `"${fieldName}" is not a "${table}" label on this page — it's a "${actualTable}" label. Move it to the "${actualTable}" array.`
          : `"${fieldName}" is not a known "${table}" label on this page. Call describe_message_page to see valid labels.`,
      );
    }
  }
  return problems;
}

/**
 * `list_topology`'s useful payload for an LLM is just what a node *is*
 * (name/path/type) and what it connects to (send/receive endpoints) — the
 * rest of `TopologyNode` is UI-only: `icon` carries a full FontAwesome/
 * custom icon definition (raw SVG path data), `actions`/`defaultAction`
 * carry the tree's right-click/toolbar menu (icons, `parameters` blobs
 * meant for the UI's own action dispatch, not something an MCP caller can
 * invoke), and `selectable`/`refreshable`/`availableMessageCounts`/
 * `errored`/`errorMessage` are rendering/loading-state flags for the tree
 * component. All of it repeats on every node and is pure noise here. Drop
 * it (recursively, since nodes nest via `children`) rather than the app's
 * own `managementExecute('listTopologies')` result, which the UI still
 * needs unmodified.
 */
interface SimplifiedTopologyNode {
  type: TopologyNode['type'];
  path: string;
  name: string;
  sendEndpoint?: TopologyNode['sendEndpoint'];
  receiveEndpoints?: TopologyNode['receiveEndpoints'];
  children?: SimplifiedTopologyNode[];
}

function simplifyTopologyNode(node: TopologyNode): SimplifiedTopologyNode {
  return {
    type: node.type,
    path: node.path,
    name: node.name,
    ...(node.sendEndpoint ? { sendEndpoint: node.sendEndpoint } : {}),
    ...(node.receiveEndpoints ? { receiveEndpoints: node.receiveEndpoints } : {}),
    ...(node.children ? { children: node.children.map(simplifyTopologyNode) } : {}),
  };
}

/**
 * `ReceivedMessage.body` is a `Uint8Array` — fine for the visible grid's
 * raw/pretty toggle, but `JSON.stringify` (this file's `json()`) serializes
 * a typed array as `{"0":1,"1":2,...}`, unusable for an LLM reading
 * `get_page_messages`. Every body this app deals with is text (JSON/CSV/
 * plain), so decode it best-effort instead — same assumption the UI's body
 * viewer already makes.
 */
function toMcpMessage(message: ReceivedMessage): Omit<ReceivedMessage, 'body'> & { body: string } {
  const { body, ...rest } = message;
  return { ...rest, body: new TextDecoder().decode(body) };
}

/**
 * Registers the v1 tool set (ADR-0010): window-control tools plus read-only
 * data tools against already-running app state. Every tool resolves an
 * explicit `workspaceId` — never an ambient "current" workspace, since more
 * than one Workspace can be open across windows at once.
 */
export function registerTools(server: McpServer): void {
  server.registerTool(
    'list_workspaces',
    {
      title: 'List Workspaces',
      description:
        'List all Workspaces known to the app, with their ids and names, plus openWorkspaceIds: the subset of those ids that currently have an open app window — the ones focus_workspace_window can bring to the front, or navigate_to_topology_node can target.',
    },
    async () => {
      const workspaces = await getWorkspacesServer().workspacesExecute(
        'listWorkspaces',
        {},
      );
      return json({
        workspaces,
        openWorkspaceIds: getOpenWorkspaceIds(App.windows),
      });
    },
  );

  server.registerTool(
    'focus_workspace_window',
    {
      title: 'Focus Workspace Window',
      description:
        "Bring the app window currently showing a Workspace to the front. Fails if no window is open for that Workspace — it does not open one.",
      inputSchema: { workspaceId: z.string().describe('The Workspace id to focus') },
    },
    async ({ workspaceId }) => {
      const window = findWindowForWorkspace(workspaceId, App.windows);
      if (!window) {
        return error(
          `No open window is currently showing Workspace ${workspaceId}.`,
        );
      }
      if (window.isMinimized()) {
        window.restore();
      }
      window.focus();
      return json({ focused: true, workspaceId });
    },
  );

  server.registerTool(
    'navigate_to_topology_node',
    {
      title: 'Navigate to Topology Node',
      description:
        "Open the broker management page in the window currently showing a Workspace, for a topology node's path (as returned by list_topology). Fails if no window is open for that Workspace. Note: v1 opens the management page but does not yet select/expand the specific node in the tree.",
      inputSchema: {
        workspaceId: z.string().describe('The Workspace id'),
        path: z.string().describe("The topology node's path, e.g. /<connectionId>/queues/my-queue"),
      },
    },
    async ({ workspaceId, path }) => {
      const window = findWindowForWorkspace(workspaceId, App.windows);
      if (!window) {
        return error(
          `No open window is currently showing Workspace ${workspaceId}.`,
        );
      }
      sendCommand(window, { type: 'navigate-to-topology-path', path });
      if (window.isMinimized()) {
        window.restore();
      }
      window.focus();
      return json({ opened: true, workspaceId, path });
    },
  );

  server.registerTool(
    'get_active_workspace',
    {
      title: 'Get Active Workspace',
      description:
        "Get the Workspace id currently shown by the active app window — the last-focused window, or the most recently opened one if none has been focused yet. Returns null if no window is open. Use this to discover which workspaceId to pass to list_connections/list_topology/list_message_pages/open_message_page when the caller doesn't already know it.",
    },
    async () => json(getActiveWorkspaceId()),
  );

  server.registerTool(
    'open_message_page',
    {
      title: 'Open Message Page',
      description:
        "Open a Message Page (as returned by list_message_pages) in the active app window — the last-focused window, or the most recently opened one if none has been focused yet. If that window isn't currently showing the given Workspace, it switches over to it first. Fails if no app window is open at all.",
      inputSchema: {
        workspaceId: z.string().describe('The Workspace id'),
        pageId: z.string().describe('The Message Page id, as returned by list_message_pages'),
      },
    },
    async ({ workspaceId, pageId }) => {
      const window = getActiveWindow(App.windows);
      if (!window) {
        return error('No app window is currently open.');
      }
      sendCommand(window, { type: 'open-message-page', workspaceId, pageId });
      if (window.isMinimized()) {
        window.restore();
      }
      window.focus();
      return json({ opened: true, workspaceId, pageId });
    },
  );

  server.registerTool(
    'list_connections',
    {
      title: 'List Connections',
      description: 'List the broker Connections belonging to a Workspace.',
      inputSchema: { workspaceId: z.string().describe('The Workspace id') },
    },
    async ({ workspaceId }) => {
      const connections = await getServer().managementExecute('listConnections', {
        workspaceId,
      });
      return json(connections);
    },
  );

  server.registerTool(
    'list_topology',
    {
      title: 'List Topology',
      description:
        'List the broker topology (queues, topics, subscriptions, etc.) for every Connection in a Workspace.',
      inputSchema: { workspaceId: z.string().describe('The Workspace id') },
    },
    async ({ workspaceId }) => {
      const topologies = (await getServer().managementExecute('listTopologies', {
        workspaceId,
      })) as TopologyNode[];
      return json(topologies.map(simplifyTopologyNode));
    },
  );

  server.registerTool(
    'get_active_page',
    {
      title: 'Get Active Page',
      description:
        'Get the Message Page currently shown in the last-opened app window, along with its Workspace id. Returns null if no window is open, or the open window is not currently viewing a Message Page.',
    },
    async () => json(getActivePage()),
  );

  server.registerTool(
    'set_active_page_filter',
    {
      title: 'Set Active Page Filter',
      description:
        "Always call describe_message_page first, before deciding what filter to place — its propertyTables tells you which labels actually exist on this page (and in which table: headers/deliveryAnnotations/messageAnnotations/properties/applicationProperties), so you're filtering on a real field instead of guessing a plausible-sounding one that happens to match nothing. Only after that, apply a filter to the Message Page currently shown in the last-opened app window (see get_active_page), replacing the filter it's currently displaying — the same shape the UI's filter builder produces. Prefer this over query_message_page whenever the request is 'show/filter to messages matching X': it drives the visible grid directly, instead of you describing matching rows back in chat. Each of headers/deliveryAnnotations/messageAnnotations/properties/applicationProperties filters one EAV property table by a fieldName that must be one of that table's labels (from describe_message_page's propertyTables — match its `table` to the array here). body filters the raw message body text directly (no fieldName) and supports contains/regex, which covers body-shaped questions like 'contains CSV data'. Fixed SQL columns outside these tables (e.g. messages.contentType) aren't filterable here at all — use query_message_page for those. Fails if no window is open, the active window isn't viewing a Message Page, or any fieldName isn't a real label for its table on this page (the error names the table it actually belongs to).",
      inputSchema: { filter: messageFilterSchema },
    },
    async ({ filter }) => {
      const window = getActiveWindow(App.windows);
      if (!window) {
        return error('No app window is currently open.');
      }
      const page = getActivePage();
      if (!page) {
        return error("The active app window isn't currently viewing a Message Page.");
      }
      const schema = await runHeadlessRequest<MessagePageLabels>(
        page.workspaceId,
        'headless:describe-page',
        { pageId: page.pageId },
      );
      const problems = findUnknownFieldNames(filter, schema);
      if (problems.length > 0) {
        return error(problems.join('\n'));
      }
      const sent = sendCommand(window, {
        type: 'set-active-page-filter',
        filter: toMessageFilter(filter),
      });
      if (!sent) {
        return error('The app window was closed while resolving this filter.');
      }
      return json({ set: true, workspaceId: page.workspaceId, pageId: page.pageId });
    },
  );

  server.registerTool(
    'get_page_messages',
    {
      title: 'Get Page Messages',
      description:
        "Get a range of actual messages (with their full body, headers, properties, annotations) from a Message Page's already-retrieved batch — for reading real content, as opposed to query_message_page's SQL-shaped analysis or set_active_page_filter's UI-driven filtering. Capped at 20 messages per call; page through more with offset. filter is optional and uses the same shape as set_active_page_filter — call describe_message_page first if using it, since fieldNames are validated the same way. If filter is omitted, this uses whatever filter is currently applied to this page in the app, but only when this page happens to be the one the active window is currently displaying — otherwise (or if nothing is applied there), all messages are considered. Pass an explicit filter (or an empty one, e.g. {}) to be sure which messages you get regardless of what the UI is currently showing.",
      inputSchema: {
        workspaceId: z.string().describe('The Workspace id'),
        pageId: z.string().describe('The Message Page id, as returned by list_message_pages'),
        offset: z
          .number()
          .int()
          .min(0)
          .default(0)
          .describe('How many matching messages to skip — page through more than `limit` results with this'),
        limit: z
          .number()
          .int()
          .min(1)
          .max(20)
          .default(20)
          .describe('How many messages to return, capped at 20 per call'),
        filter: messageFilterSchema
          .optional()
          .describe(
            "Same shape as set_active_page_filter's filter. Omit to use the page's currently active filter (if this is the page the active window is showing); pass {} for explicitly no filter.",
          ),
      },
    },
    async ({ workspaceId, pageId, offset, limit, filter }) => {
      try {
        let effectiveFilter: MessageFilter | undefined;
        if (filter) {
          const schema = await runHeadlessRequest<MessagePageLabels>(
            workspaceId,
            'headless:describe-page',
            { pageId },
          );
          const problems = findUnknownFieldNames(filter, schema);
          if (problems.length > 0) {
            return error(problems.join('\n'));
          }
          effectiveFilter = toMessageFilter(filter);
        } else {
          effectiveFilter = getActivePageFilterFor(workspaceId, pageId) ?? undefined;
        }

        const messages = await runHeadlessRequest<ReceivedMessage[]>(
          workspaceId,
          'headless:get-messages',
          { pageId, filter: effectiveFilter, skip: offset, take: limit },
        );

        return json({
          workspaceId,
          pageId,
          offset,
          limit,
          count: messages.length,
          usedFilter: effectiveFilter ?? null,
          messages: messages.map(toMcpMessage),
        });
      } catch (err) {
        return error(err instanceof Error ? err.message : String(err));
      }
    },
  );

  server.registerTool(
    'get_selected_message',
    {
      title: 'Get Selected Message',
      description:
        "Get the full message (headers, properties, annotations, application properties, body) currently selected in the Message Page grid of the last-opened app window, along with its Workspace and Message Page id. Returns null if no window is open, the open window isn't viewing a Message Page, or nothing is selected in its grid.",
    },
    async () => {
      const ref = getSelectedMessageRef();
      if (!ref) {
        return json(null);
      }

      try {
        const message = await runHeadlessRequest(ref.workspaceId, 'headless:get-message', {
          pageId: ref.pageId,
          messageKey: ref.messageKey,
        });
        return json({
          workspaceId: ref.workspaceId,
          pageId: ref.pageId,
          pageName: ref.pageName,
          message,
        });
      } catch (err) {
        return error(err instanceof Error ? err.message : String(err));
      }
    },
  );

  server.registerTool(
    'list_message_pages',
    {
      title: 'List Message Pages',
      description:
        'List the open Message Pages (already-retrieved message batches) for a Workspace, with their id, name, and retrieval time. Lazily starts a hidden per-Workspace renderer if one is not already running (ADR-0011); it stays warm for 5 minutes of inactivity.',
      inputSchema: { workspaceId: z.string().describe('The Workspace id') },
    },
    async ({ workspaceId }) => {
      try {
        const pages = await runHeadlessRequest(workspaceId, 'headless:list-pages');
        return json(pages);
      } catch (err) {
        return error(err instanceof Error ? err.message : String(err));
      }
    },
  );

  server.registerTool(
    'describe_message_page',
    {
      title: 'Describe Message Page',
      description:
        "Describe a Message Page's full queryable SQL shape for query_message_page: every table's real columns (introspected from the database, not a hand-written list, so it can't be stale), plus each property table's (headers/properties/deliveryAnnotations/messageAnnotations/applicationProperties) known labels and types. Every property table is EAV-shaped (messageId, propertyName, propertyType, propertyValue) and joins to messages.id — the label you want (e.g. 'DeadLetterReason') is a *row value* in propertyName, not a column, so filter on it rather than selecting it by name. See the returned exampleQuery for the join pattern.",
      inputSchema: {
        workspaceId: z.string().describe('The Workspace id'),
        pageId: z.string().describe('The Message Page id, as returned by list_message_pages'),
      },
    },
    async ({ workspaceId, pageId }) => {
      try {
        const schema = await runHeadlessRequest(workspaceId, 'headless:describe-page', {
          pageId,
        });
        return json(schema);
      } catch (err) {
        return error(err instanceof Error ? err.message : String(err));
      }
    },
  );

  server.registerTool(
    'query_message_page',
    {
      title: 'Query Message Page',
      description:
        "Run a read-only SQL statement against a Message Page's SQLite database (ADR-0012), for ad-hoc analysis (filtering, counting, grouping) beyond what the UI's filter builder supports — aggregates, joins, fixed columns like messages.contentType, or listing/summarizing results in chat. If the user wants matching messages actually shown/filtered to in the app window, use set_active_page_filter instead (or in addition) so the grid itself updates, rather than only reporting matches here. The connection is opened read-only at the SQLite engine level, so mutating statements fail regardless of shape. Call describe_message_page first to see the queryable columns and property tables.",
      inputSchema: {
        workspaceId: z.string().describe('The Workspace id'),
        pageId: z.string().describe('The Message Page id, as returned by list_message_pages'),
        sql: z.string().describe('A read-only SQL statement, e.g. a SELECT with WHERE/GROUP BY/aggregates'),
      },
    },
    async ({ workspaceId, pageId, sql }) => {
      try {
        const result = await runHeadlessRequest(workspaceId, 'headless:run-query', {
          pageId,
          sql,
        });
        return json(result);
      } catch (err) {
        return error(err instanceof Error ? err.message : String(err));
      }
    },
  );
}
