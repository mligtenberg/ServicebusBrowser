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
- Renderer-mutating tools (`navigate_to_topology_node`, `open_message_page`,
  `set_active_page_filter`) all go through one bridge instead of one IPC
  channel/preload method/listener per tool: `tools.ts`'s `sendCommand()`
  sends an `McpCommand` (a discriminated union on `type`) over a single
  `mcp:command` channel; `main.preload.ts` exposes it as one
  `onMcpCommand(callback)`; `main-shell.ts` has one listener with a
  `switch (command.type)`. Adding another renderer-mutating tool means
  adding one variant to `McpCommand` (defined independently, but kept
  structurally identical, on both the main-process and renderer side —
  Electron's process boundary means there's no single shared type to
  import) and one `case` in the switch, not a new channel/method/listener
  trio.
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
  a `navigate-to-topology-path` command (see the shared `mcp:command`
  bridge above) that opens the management page. **v1 limitation**: there is
  no in-tree "select/expand to this node" state
  anywhere in the app (`libs/topology/components`'s tree selection is
  component-local signals with no path-driven API), so this only opens the
  page and shows the requested path in a toast — it does not highlight the
  specific node yet.
- `list_connections` / `list_topology` — thin wrappers over
  `Server.managementExecute('listConnections'|'listTopologies', {workspaceId})`,
  the same actions the renderer's IPC channel already calls. `list_topology`
  additionally maps every node through `simplifyTopologyNode()`
  (`tools.ts`), recursively (nodes nest via `children`) reducing each
  `TopologyNode` to just `type`/`path`/`name`/`sendEndpoint`/
  `receiveEndpoints`/`children` — dropping `icon` (a full FontAwesome/custom
  icon definition), `actions`/`defaultAction` (the tree's right-click/
  toolbar menu — UI dispatch only, not something an MCP caller can invoke),
  and the tree component's own rendering/loading-state flags
  (`selectable`/`refreshable`/`availableMessageCounts`/`errored`/
  `errorMessage`). None of it is useful to an LLM and all of it repeats on
  every node; the app's own `managementExecute` result (what the UI itself
  renders from) is untouched.
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
  an `open-message-page` command (see the shared `mcp:command` bridge
  above), which just does `router.navigateByUrl` to
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
- `list_message_pages` / `describe_message_page` / `query_message_page` /
  `get_page_messages` — see "Message Page query tools" below.
- `set_active_page_filter` — applies a `MessageFilter` (the same shape
  `libs/messages/filtering`'s `MessageFilter` model and the UI's filter
  builder use, validated with a zod schema mirroring that interface) to
  whichever Message Page the active window's route is currently showing.
  Sends a `set-active-page-filter` command (see the shared `mcp:command`
  bridge above) with just the filter payload; `main-shell.ts` resolves the
  target `pageId` itself from a fresh `selectActivePage` read (rather than
  reusing `get_active_page`'s
  possibly-stale main-process cache) and dispatches the existing
  `messagePagesActions.setPageFilter({ pageId, filter })` NgRx action
  (`libs/messages/store`) — the same action `messages-page.component.ts`'s
  filter-builder UI dispatches. Fails if no window is open, or the active
  window isn't currently viewing a Message Page.
  - **Field-name validation**: `headers`/`deliveryAnnotations`/
    `messageAnnotations`/`properties`/`applicationProperties` each filter
    one EAV property table by a `fieldName` that must be one of that
    table's real labels (the same tables `describe_message_page`'s
    `propertyTables` reports labels for) — a `fieldName` from the wrong
    table used to silently match zero messages instead of failing. The
    handler now re-fetches the page's schema via
    `headless:describe-page` and calls `findUnknownFieldNames()`
    (`tools.ts`) before sending the command, erroring out with the table
    the label actually belongs to if it's misplaced.
  - **`body` is a real filter target**: it matches each message's raw body
    text directly (no `fieldName`, since there's one body per message) via
    `contains`/`regex`/etc. — an earlier session hallucinated that body
    filtering wasn't supported (it's right there in the schema, just easy
    to miss in a flattened JSON Schema blob) and fell back to
    `query_message_page` + a chat-listed result instead of actually
    filtering the page. Every array's zod schema now carries an explicit
    `.describe()` spelling out its table/labels/body semantics, and the
    tool's own description states the `describe_message_page`-first
    workflow and nudges callers to prefer this tool over
    `query_message_page` whenever the ask is "filter/show messages
    matching X" rather than "analyze/count/summarize in chat".
  - **Not filterable here**: fixed SQL columns outside the five EAV
    tables and `body` — e.g. `messages.contentType` — have no filter
    target in `MessageFilter` at all (the UI's filter builder can't
    express them either); `query_message_page` is the only way to filter
    on those.

## Message Page query tools (ADR-0011/0012)

Message Page data (already-retrieved messages) lives in per-page SQLite
files inside OPFS — a browser API, unreachable from the main process. These
tools go through a hidden renderer instead:

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
- `get_page_messages` — a fourth query tool, reading actual hydrated
  messages (body, headers, properties, annotations) rather than SQL rows or
  a filter push. Adds `headless:get-messages` (`headless-window-manager.ts`'s
  `HeadlessChannel` union, `app.ts`'s bridge handler) calling
  `MessagesRepository.getMessages(pageId, filter, skip, take)`
  (`libs/messages/messages-db`) — the same paginated/filtered load the
  visible grid itself uses. Capped at 20 messages per call
  (`limit`/`offset` in the zod `inputSchema`); each `ReceivedMessage`'s
  `body` (a `Uint8Array`) is decoded with `TextDecoder` before being
  JSON-returned (`toMcpMessage()`), since every body this app deals with is
  text and a typed array serializes uselessly via `JSON.stringify`
  (`{"0":1,"1":2,...}`).
  - **Filter defaulting**: `filter` is optional and reuses
    `messageFilterSchema`/`findUnknownFieldNames` exactly like
    `set_active_page_filter`. If omitted, the tool falls back to whatever
    filter is currently applied to that page in the app — but that filter
    value lives only in a renderer's NgRx store (`libs/messages/store`),
    which main has no way to read on demand. So `main-shell.ts` now also
    pushes it proactively: a second `selectActivePage`-based subscription
    (deduped on the filter's JSON, not just page id — the same page can get
    a new filter without its id changing) calls a new
    `reportActivePageFilter` bridge method
    (`workspace-window:report-active-page-filter` →
    `setActivePageFilterForWindow`/`getActivePageFilterForWindow` in
    `workspace-window-registry.ts`, mirroring `reportActivePage`'s existing
    pattern exactly). `active-page.ts`'s `getActivePageFilterFor(workspaceId,
    pageId)` only returns that cached filter when the given ids match the
    active window's *actual* active page — for any other `pageId`, main has
    no way to know its filter, so the tool falls back to unfiltered rather
    than guessing. The response's `usedFilter` field always states which
    filter (if any) was actually applied, so the caller isn't left guessing
    either.

## Deferred (not yet built)

- Broker-mutating tools (send/complete/dead-letter a message) — deferred by
  design (ADR-0010's consequences section), to be added additively later.
- Cross-page/cross-Workspace aggregation for `query_message_page` — each
  query is scoped to one page's own SQLite file, per ADR-0012.
