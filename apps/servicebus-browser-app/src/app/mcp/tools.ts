import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { TopologyNode } from '@service-bus-browser/api-contracts';
import App from '../app';
import { getServer } from '../events/service-bus.events';
import { getWorkspacesServer } from '../events/workspace.events';
import { findWindowForWorkspace } from '../events/workspace-window-registry';
import { runHeadlessRequest } from './headless-window-manager';
import { getActivePage, getSelectedMessageRef } from './active-page';

function json(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

function error(message: string) {
  return { content: [{ type: 'text' as const, text: message }], isError: true };
}

/**
 * `TopologyNode.icon` carries a full FontAwesome/custom icon definition
 * (raw SVG path data, not just a name) for the UI's tree to render — useful
 * there, pure noise for an LLM reading list_topology, and it repeats on
 * every node in the tree. Strip it (recursively, since nodes nest via
 * `children`) rather than the app's own `managementExecute('listTopologies')`
 * result, which the UI still needs unmodified.
 */
function stripIcons(node: TopologyNode): Omit<TopologyNode, 'icon'> {
  const { icon: _icon, children, ...rest } = node;
  return {
    ...rest,
    ...(children ? { children: children.map(stripIcons) } : {}),
  };
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
      description: 'List all Workspaces known to the app, with their ids and names.',
    },
    async () => {
      const workspaces = await getWorkspacesServer().workspacesExecute(
        'listWorkspaces',
        {},
      );
      return json(workspaces);
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
      window.webContents.send('mcp:navigate-to-topology-path', path);
      if (window.isMinimized()) {
        window.restore();
      }
      window.focus();
      return json({ opened: true, workspaceId, path });
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
      return json(topologies.map(stripIcons));
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
        "Run a read-only SQL statement against a Message Page's SQLite database (ADR-0012), for ad-hoc analysis (filtering, counting, grouping) beyond what the UI's filter builder supports. The connection is opened read-only at the SQLite engine level, so mutating statements fail regardless of shape. Call describe_message_page first to see the queryable columns and property tables.",
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
