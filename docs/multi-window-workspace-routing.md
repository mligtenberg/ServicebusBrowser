# Multi-Window Workspace Routing

Both apps can have more than one window/tab open on a different Workspace at
once — the desktop app (`servicebus-browser-app`) via `File → New Window` /
`App.openNewWindow()` in
[`apps/servicebus-browser-app/src/app/app.ts`](../apps/servicebus-browser-app/src/app/app.ts),
the web app via plain browser tabs. Per
[ADR-0001](./adr/0001-single-active-workspace.md), each window has exactly one
active Workspace at a time. Per
[ADR-0009](./adr/0009-workspace-id-in-url.md), that Workspace lives in the URL
itself, as a `:workspaceId` route segment — not a boot-only query param or a
single shared `localStorage` value.

## The `:workspaceId` route segment

In both apps' route config, `:workspaceId` wraps the Workspace-scoped routes
(`messages`, `manage-service-bus`, Home); `popups`, `about`, and (web)
`oidc-callback`/`login-failed` stay unprefixed. On web that's
`/<workspaceId>/messages/...`; on desktop, which uses hash-based routing,
it's `#/<workspaceId>/messages/...`.

## `workspaceActivationGuard` and `rootWorkspaceRedirectGuard`

Both apps define these in `workspace-route.guard.ts`:

- **`workspaceActivationGuard`** guards the `:workspaceId` route. It resolves
  the id against the loaded Workspace list:
  - Unresolvable (missing, unknown, or deleted/restructured) → redirects to
    the fallback Workspace's default route (see below).
  - Resolvable and different from the window's current active Workspace →
    calls `WorkspaceSwitchService.activate(workspace, { persist: false })`,
    which tears down/rehydrates the NgRx stores and brings up (first
    activation) or switches (subsequent activation) the messages-db, the same
    as an explicit switch — just without writing `localStorage`.

  The route is configured with `runGuardsAndResolvers: 'paramsChange'`, so
  this guard reruns on *every* change of `:workspaceId` — not just boot, but
  address-bar edits and browser back/forward too.

- **`rootWorkspaceRedirectGuard`** guards the bare root path (no segments at
  all) and always redirects into the fallback Workspace's default route.

Both call `WorkspaceService.ensureWorkspacesLoaded()` first, which lazily
fetches the Workspace list once and caches the in-flight promise. This runs
from the guard rather than an app initializer so that, on the web app, it
executes *after* `AutoLoginPartialRoutesGuard` has already resolved on the
same parent route — app initializers all run concurrently with each other and
can't offer that ordering, but nested route guards resolve strictly parent
before child.

## The fallback chain

`WorkspaceService.resolveFallback()` is the single fallback path used by
both guards: the last-active id from `localStorage`
(`sbb-active-workspace-id`) if it still resolves against the loaded Workspace
list, else the first Workspace in that list. If it had to fall back past a
missing/invalid stored id, it writes the resolved id back — so the next such
fallback doesn't repeat the same resolution — but a resolvable `:workspaceId`
already in the URL never causes a `localStorage` write on its own.

`localStorage`'s pointer only otherwise moves on an explicit action:

- `WorkspaceSwitchService.switchTo()` (the switcher's in-place "open here"
  flow) calls `WorkspaceService.setActive()`, which persists it.
- The switcher's "open in a new window" action calls
  `WorkspaceService.rememberLastActiveId()` directly, from the *source*
  window — the new window itself only ever activates in-memory (see above).

## Main-process registry (desktop only)

`apps/servicebus-browser-app/src/app/events/workspace-window-registry.ts`
holds an in-memory `Map<windowId, workspaceId>` — no persistence, rebuilt
from scratch every app launch as renderers report in. Three IPC channels
(registered in `workspace.events.ts`, exposed via `main.preload.ts` as
`window.electron.*`) drive it:

- `workspace-window:report-active` (renderer → main, fire-and-forget): sent
  by `WorkspaceSwitchService.activate()` on every activation (boot, guard-
  driven, or explicit switch). Resolves the sender's window via
  `BrowserWindow.fromWebContents(event.sender)`.
- `workspace-window:focus-if-open` (renderer → main, invoke): looks up
  `App.windows` for a window whose registry entry matches; focuses it if it's
  a different window than the caller, and reports back whether it was found
  and whether it was the caller's own window. Only called from the
  switcher's explicit "open this workspace" flow — a plain `File → New
  Window` or a direct URL/hash edit that happens to land on an already-open
  Workspace is not checked (see ADR-0009's Consequences).
- `workspace-window:open-in-new-window` (renderer → main, invoke): calls
  `App.openNewWindow(workspaceId)`, which loads the new window straight at
  `#/<workspaceId>`.

A window's registry entry is dropped when it closes (`forgetWindow`, called
from the `closed` handler in `app.ts`'s `createWindow()`), so a closed
window's Workspace is treated as no-longer-open.

## Renderer-side wrapper

`apps/servicebus-browser-frontend/src/app/workspace-window.service.ts`
(`WorkspaceWindowService`) wraps the three `window.electron.*` calls above,
same as the existing ad-hoc `window.electron?.foo?.()` guards elsewhere in
this app (e.g. `main-shell.ts`) — it's a no-op wherever the `electron` bridge
isn't present (the web frontend), so nothing here is Electron-only-aware
beyond this one service.
