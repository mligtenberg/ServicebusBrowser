# MCP Server (Desktop)

Implements ADR-0010: the desktop app can host an MCP server directly in its
Electron main process, off by default, enabled from the "MCP Server" popup
(Settings menu → MCP Server, `apps/servicebus-browser-frontend/src/app/popups/mcp-settings-popup`).

## Main-process pieces

- `apps/servicebus-browser-app/src/app/events/secure-storage/mcp-settings.ts` —
  `McpSettingsStorage`: persists `{enabled, port, token}` to
  `sbb-mcp-settings.json` in plaintext (the token only protects a loopback
  HTTP server, not a remote credential).
- `apps/servicebus-browser-app/src/app/mcp/mcp-server.ts` — `McpServerHost`:
  owns the HTTP listener. Uses the SDK's `createMcpExpressApp({host:
  '127.0.0.1'})` (DNS-rebinding protection built in) plus a bearer-token
  `Authorization` check. One stateless `McpServer`/`StreamableHTTPServerTransport`
  pair per request — no MCP session state to keep alive.
- `apps/servicebus-browser-app/src/app/mcp/tools.ts` — `registerTools()`:
  the v1 tool set. Every tool takes an explicit `workspaceId` (never an
  ambient "current" workspace).
- `apps/servicebus-browser-app/src/app/events/mcp.events.ts` — IPC handlers
  (`mcp:get-status`/`set-enabled`/`set-port`/`regenerate-token`) that the
  settings popup calls, and `applySettings()` which starts/stops
  `McpServerHost` and toggles the tray icon.
- `App.setMcpEnabled()` in `apps/servicebus-browser-app/src/app/app.ts`:
  shows/hides a tray icon (Open / Regenerate token / Quit) and changes
  `onWindowAllClosed` to not quit while MCP is enabled, since the server
  should keep running with no windows open.

## v1 tools

- `list_workspaces` — via the existing `WorkspacesServer`, plus
  `openWorkspaceIds`: the subset of those ids with an open app window
  (`workspace-window-registry`'s `getOpenWorkspaceIds`), so a client can tell
  up front which ones `focus_workspace_window`/`navigate_to_topology_node`
  (both require an already-open window) can actually target.
- `focus_workspace_window` — via `workspace-window-registry`'s
  `findWindowForWorkspace`; fails (does not open a window) if none is open.
- `navigate_to_topology_node` — focuses the Workspace's window and sends it
  an IPC event (`mcp:navigate-to-topology-path`, wired in `main.preload.ts`
  and consumed in `main-shell.ts`) that opens the management page. **v1
  limitation**: there is no in-tree "select/expand to this node" state
  anywhere in the app (`libs/topology/components`'s tree selection is
  component-local signals with no path-driven API), so this only opens the
  page and shows the requested path in a toast — it does not highlight the
  specific node yet.
- `list_connections` / `list_topology` — thin wrappers over
  `Server.managementExecute('listConnections'|'listTopologies', {workspaceId})`,
  the same actions the renderer's IPC channel already calls.
- `get_active_page` — the Message Page currently shown by the active
  window's route, plus its Workspace id. A synchronous read of
  `workspace-window-registry`'s `activePageByWindowId` map, kept current by
  a push from `main-shell.ts` (`workspace-window:report-active-page`,
  mirroring the existing `report-active` workspace push) every time
  `@service-bus-browser/main-ui`'s `selectActivePage` changes — the main
  process has no other way to observe a window's live Angular Router state,
  and every IPC channel in the app is fire-and-forget push, never a pull
  query with a response round trip.
- `get_active_workspace` — the Workspace id shown by the active window, with
  no Message Page requirement (unlike `get_active_page`). The entry point
  for an MCP client that doesn't already know a `workspaceId`: call this
  first, then feed the result into `list_connections`/`list_topology`/
  `list_message_pages`/`open_message_page`.
- `open_message_page` — opens a Message Page (by `workspaceId`/`pageId`, as
  returned by `list_message_pages`) in the active window, switching that
  window to the given Workspace first if it isn't already showing it. Sends
  it `mcp:open-message-page` (wired in `main.preload.ts`, consumed in
  `main-shell.ts`), which just does `router.navigateByUrl` to
  `/<workspaceId>/messages/page/<pageId>` — `selectActivePage` derives from
  matching the current route, and a `:workspaceId` change alone is enough to
  trigger `workspaceActivationGuard`'s switch (see
  [Multi-Window Workspace Routing](./multi-window-workspace-routing.md)), so
  no separate action dispatch is needed. Unlike `focus_workspace_window`/
  `navigate_to_topology_node`, this does not require a window already open
  for that Workspace — it repurposes whichever window is active. Fails only
  if no app window is open at all.

**"The active window"**: `workspace-window-registry`'s `getActiveWindow()`
is the last-focused window (tracked via a `focus` listener registered on
every window in `app.ts`'s `createWindow()`), falling back to the most
recently *opened* one if nothing has been focused yet — e.g. the app was
driven entirely over MCP with its window backgrounded the whole time. This
replaced an earlier, cruder "last-opened window" heuristic that
`get_active_page`/`get_selected_message` used before `open_message_page`/
`get_active_workspace` needed real focus tracking to make "open in the
window the user is looking at" true.
- `list_message_pages` / `describe_message_page` / `query_message_page` —
  see "Message Page query tools" below.

## Message Page query tools (ADR-0011/0012)

Message Page data (already-retrieved messages) lives in per-page SQLite
files inside OPFS — a browser API, unreachable from the main process. These
three tools go through a hidden renderer instead:

- `apps/servicebus-browser-headless` — a new, minimal Nx Angular app,
  distinct from `servicebus-browser-frontend`. Its only component
  (`src/app/app.ts`) reads `workspaceId` from its URL's query string, calls
  `migrateOpfsFiles`/`initializeWorkspace`/`getMessagesRepository` from
  `@service-bus-browser/messages-db`, then answers RPCs over
  `window.headlessApi` (exposed by the same `main.preload.ts` the visible
  app uses). Deliberately skips NgRx/router/topology/menu machinery — none
  of it is needed just to read a Message Page's SQLite file, so this is
  leaner than ADR-0011 originally sketched. Its template renders a simple
  dark-mode log of the last 20 RPCs (channel, request payload, response or
  `pending…`) — invisible in packaged builds since the window itself stays
  hidden there, but it's what you actually see in the dev-mode window
  described below, since `show:false` would otherwise leave a blank page.
- `apps/servicebus-browser-app/src/app/mcp/headless-window-manager.ts` —
  `runHeadlessRequest(workspaceId, channel, payload)`: lazily creates a
  `BrowserWindow` per `workspaceId`, waits for its `headless:ready` signal,
  then round-trips an IPC request/response pair. Each Workspace's window is
  torn down after 5 minutes with no queries; a query for a different
  Workspace always gets its own window. In development (`App.isDevelopmentMode()`)
  the window is shown with its DevTools console open instead of hidden —
  otherwise there'd be no way to see this renderer's logs, since it never
  appears in the dock/taskbar the way a normal window would. Packaged builds
  always keep it hidden (`show:false`).
- **Same-origin requirement**: OPFS is origin-scoped, so this renderer must
  load from the exact same origin as the visible one, under a `/headless`
  path prefix, or it would see an empty OPFS instead of the Message Page
  files the visible renderer wrote. In development, `App.loadURL`s it at
  `http://localhost:<rendererAppPort>/headless/`, and `proxy.conf.json`
  (`servicebus-browser-frontend`'s dev-server proxy config, the same
  mechanism used for `/api`) forwards `/headless/*` unchanged to the
  headless app's own dev server on `headlessRendererAppPort`
  (`constants.ts`), which is itself configured with `servePath: "/headless/"`
  (`servicebus-browser-headless/project.json`'s `serve` target) so every
  asset URL it emits — and Vite's own internal `fs.allow` resolution for
  its dep-cache/sourcemap requests — already carries that same prefix,
  rather than resolving against `servicebus-browser-frontend`'s dev server
  root by mistake. In packaged builds, it loads `app://localhost/headless/`, and
  `app.ts`'s `app://` protocol handler routes any `/headless` path to
  `headlessRendererAppName`'s files instead of the main renderer's — one
  scheme, path-routed, rather than a second `app-headless://` scheme (which
  would have been a different origin from `app://`, defeating the point).
- `libs/messages/messages-db`'s `queryMessagePageReadOnly()` — opens a
  dedicated connection to a page's SQLite file with the `mode=ro` file-URI
  flag and runs the caller's SQL. That flag, not statement parsing, is the
  only safety mechanism (ADR-0012): mutation fails at the SQLite engine
  level regardless of query shape. Its `type: 'error'`-shaped promiser
  rejection (see `sqllite/database.ts`'s `toSqliteError()`) is converted to a
  real `Error` before it gets here — otherwise a bad query (e.g. a column
  that doesn't exist) surfaced to the MCP client as the literal string
  `"[object Object]"` instead of SQLite's actual error message.
- **Concurrent connections and `SQLITE_BUSY`**: the visible app window may
  already hold its own open connection to a page's SQLite file when the
  headless renderer opens another one — every `Database` connection now
  sets `PRAGMA busy_timeout = 5000` on open, so the two take turns instead
  of one instantly failing with `SQLITE_BUSY: database is locked`.
  Separately, `queryMessagePageReadOnly()`'s callers that need several
  queries (schema introspection below) should share one connection via
  `withReadOnlyMessagePage()` rather than opening one per query — several
  *concurrent* opens against the same OPFS file is its own, entirely
  self-inflicted, way to hit the same error.
- `describeMessagePage()` returns every table's real columns —
  introspected via `PRAGMA table_info` against the page's own SQLite file
  (one shared connection, queried sequentially — see above), not a
  hand-maintained list, so it can't go stale the way the old hardcoded
  column list did (it was missing `messages.message`, an internal BSON
  blob) — plus each property table's known labels/types, reusing the same
  label lookups the UI's filter builder already exposes, since which
  `propertyName`s exist on a page is *data*, not schema, and PRAGMA
  introspection alone can't tell you that. Also returns a worked
  `exampleQuery` joining a property table by label, since property tables
  are EAV-shaped (`messageId, propertyName, propertyType, propertyValue`)
  and an LLM naively querying them as if the label were a column name (e.g.
  `SELECT DeadLetterReason FROM messages`) is the most common failure mode.
- Packaging: `servicebus-browser-app:package`/`make` pass
  `extraProjects: ["servicebus-browser-headless/browser"]` so the headless
  build ships alongside the main renderer — see
  [Desktop Build Process](./desktop-build-process.md).

## Deferred (not yet built)

- Broker-mutating tools (send/complete/dead-letter a message) — deferred by
  design (ADR-0010's consequences section), to be added additively later.
- Cross-page/cross-Workspace aggregation for `query_message_page` — each
  query is scoped to one page's own SQLite file, per ADR-0012.
