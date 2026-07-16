# Workspace lifecycle and NgRx effects timing

## The gotcha

NgRx registers effects via `provideEnvironmentInitializer`, which Angular runs
synchronously **when the root injector is created** — before any
`provideAppInitializer` callback has completed. This means:

- `ngrxOnInitEffects()` and effect class construction always run **before**
  `WorkspaceService.initialize()` has been called.
- Any effect logic that reads `workspaceService.activeWorkspace()` at
  registration/init time will see `undefined`.

This caused a real bug: the tab (page) order restore in `PageEffects` used
`ngrxOnInitEffects()` and always saw no active workspace, so the persisted
order in localStorage was loaded in the wrong shape and silently ignored on
every boot ("changing the tab order does not persist").

## The pattern: `pagesActions.workspaceActivated`

Workspace-dependent startup work must be event-driven, not init-driven.
`pagesActions.workspaceActivated({ workspaceId })` (in
`libs/main-ui/src/lib/ngrx/route.actions.ts`) is dispatched at every point a
workspace becomes active:

1. **Electron app boot** — the `provideAppInitializer` in
   `apps/servicebus-browser-frontend/src/app/app.config.ts`, right after
   `workspaceService.initialize(...)`.
2. **Web app boot** — `MainApp.ngOnInit` in
   `apps/servicebus-browser-web-frontend/src/app/main-app/main-app.ts`.
3. **Workspace switch** — `WorkspaceSwitchService.switchTo` in both apps.

Effects that need the active workspace at startup should listen for this
action (which carries the workspace id) instead of implementing
`OnInitEffects`.

## Page (tab) order persistence

`PageEffects` (`libs/main-ui/src/lib/ngrx/page.effects.ts`):

- `loadPageOrder$` — on `workspaceActivated`, reads the `pagesOrder`
  localStorage key, which is shaped `{ [workspaceId]: { [position]: pageId } }`,
  migrates the legacy flat `{ [position]: pageId }` format, sanitizes corrupt
  entries, and dispatches `loadPageOrderFromStorage`.
- `storePageOrder$` — on `movePage` **and** `closePage` (closing shifts
  positions), writes the route state's position map back under the active
  workspace id, preserving other workspaces' entries.

Covered by `libs/main-ui/src/lib/ngrx/page.effects.spec.ts`. Note for tests:
`libs/main-ui/jest.config.ts` maps `@service-bus-browser/messages-db` and
`@zip.js/zip.js` to stubs because those packages boot web workers at import
time, which jest cannot compile.
