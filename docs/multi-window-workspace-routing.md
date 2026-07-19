# Multi-Window Workspace Routing (Desktop)

The desktop app (`servicebus-browser-app`) can have more than one `BrowserWindow`
open at once (`File → New Window`, `App.openNewWindow()` in
[`apps/servicebus-browser-app/src/app/app.ts`](../apps/servicebus-browser-app/src/app/app.ts)).
Each window runs its own independent renderer and, per
[ADR-0001](./adr/0001-single-active-workspace.md), has exactly one active
Workspace at a time — but nothing before this feature tracked *which* window
had *which* Workspace open. Opening a Workspace that was already active in
another window would just switch it into the current window too, effectively
duplicating it.

## Opening-a-Workspace flow

When the user picks a Workspace from the workspace switcher
(`apps/servicebus-browser-frontend/src/app/main-shell/workspace-switcher/workspace-switcher.ts`),
the flow is:

1. **Check** whether that Workspace is already open in some window, via the
   main-process registry (below).
2. **If so**, focus that window (restoring it if minimized) and stop — no
   dialog, nothing switches in the current window.
3. **If not**, show an "Open Workspace" dialog: *This Window* (the existing
   switch-in-place behavior, including the "cancel active loads?" confirm if
   message loads are running) or *New Window* (opens a fresh `BrowserWindow`
   that boots directly into that Workspace).

## Main-process registry

`apps/servicebus-browser-app/src/app/events/workspace-window-registry.ts`
holds an in-memory `Map<windowId, workspaceId>` — no persistence, rebuilt
from scratch every app launch as renderers report in. Three IPC channels
(registered in `workspace.events.ts`, exposed via `main.preload.ts` as
`window.electron.*`) drive it:

- `workspace-window:report-active` (renderer → main, fire-and-forget): sent on
  boot (`app.config.ts`'s `provideAppInitializer`) and after every in-place
  switch (`WorkspaceSwitchService.switchTo`). Resolves the sender's window via
  `BrowserWindow.fromWebContents(event.sender)`.
- `workspace-window:focus-if-open` (renderer → main, invoke): looks up
  `App.windows` for a window whose registry entry matches; focuses it if it's
  a different window than the caller, and reports back whether it was found
  and whether it was the caller's own window.
- `workspace-window:open-in-new-window` (renderer → main, invoke): calls
  `App.openNewWindow(workspaceId)`, which appends `?openWorkspaceId=<id>` to
  the new window's initial URL.

A window's registry entry is dropped when it closes (`forgetWindow`, called
from the `closed` handler in `app.ts`'s `createWindow()`), so a closed
window's Workspace is treated as no-longer-open.

## Booting into a specific Workspace

`?openWorkspaceId=` is a plain query-string param on the window's load URL
(`app://localhost?openWorkspaceId=...` or the dev-server equivalent) — it does
**not** ride on the hash-based Angular route, since `withHashLocation()` means
the Workspace is never otherwise part of the URL.
`WorkspaceService.initialize(workspaces, preferredId?)`
(`libs/shared/services/src/lib/workspace.service.ts`) takes this as an
optional override that wins over the localStorage last-active id.

## Renderer-side wrapper

`apps/servicebus-browser-frontend/src/app/workspace-window.service.ts`
(`WorkspaceWindowService`) wraps the three `window.electron.*` calls above,
same as the existing ad-hoc `window.electron?.foo?.()` guards elsewhere in
this app (e.g. `main-shell.ts`) — it's a no-op wherever the `electron` bridge
isn't present (the web frontend), so nothing here is Electron-only-aware
beyond this one service.
