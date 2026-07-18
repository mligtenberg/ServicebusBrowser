---
status: accepted
---

# Add-connection form runs in a separate popup window, not an in-app modal

The "Add connection" flow is being redesigned. It currently lives as a full-page
route (`/connections/add`) reached from a main-shell menu item — a narrow form on
a large empty canvas, which reads as sparse and unfinished. We want it to feel
like a focused "create one thing" task with a clear frame.

We decided to render it in a **separate Electron `BrowserWindow`**, opened with
`window.open` against a `/popups/connections/add` route, reusing the exact
mechanism the message **body-viewer** already established: an internal `/popups/`
URL is matched by `setWindowOpenHandler` in
`apps/servicebus-browser-app/src/app/app.ts` and allowed as a ~900×700 window with
its own preload; the route provides its own NgRx connections store instance. This
is a deliberate choice **over** an in-app modal built on the existing
`SbbDialog` / `SbbDialogService`.

A separate OS window is **non-modal** — the main window (topology tree, message
pages) stays live and usable while the form is open. That is the property we
want: adding a connection should not freeze the rest of the app, and the popup
pattern is already familiar in this codebase for the body-viewer.

Because the window is separate and non-modal, it does not share the main window's
store, so it cannot refresh the topology tree directly. On a successful save the
popup **closes itself immediately** and broadcasts on `BroadcastChannel('connections')`;
the **main window** listens, dispatches `TopologyActions.loadTopologyRootNodes()`
to surface the new connection, and shows a success toast via `SbbToastService`.
`BroadcastChannel` is the same cross-window signalling the body-viewer uses for
live-session actions.

This is desktop-centric. On the web build the connection store is read-only
(`ReadonlyConfigFileConnectionStorage`), so there is no real add path there to
reconcile.

## Considered Options

- **In-app modal (`SbbDialog` / `SbbDialogService`)** — rejected. It is the
  obvious default and would avoid all cross-window machinery: same store, direct
  topology refresh, no `BroadcastChannel`, no `window.open`. But it is modal — it
  blocks interaction with the tree and message pages while open — and it diverges
  from the body-viewer pattern the app already uses for "pop this out into its own
  space." We accept the extra cross-window plumbing to get non-modality and
  pattern consistency.
- **Keep the full-page route** — rejected. It is the status quo and the source of
  the "sparse and ugly" complaint that started the redesign; a page-sized canvas
  for a short form has no natural frame and no obvious place for footer actions.

## Consequences

- **Cross-window refresh is required and easy to get wrong.** The popup's own
  store refreshing topology is invisible to the main window. The save path MUST
  broadcast on `BroadcastChannel('connections')`, and the main window MUST have a
  listener wired that both reloads topology root nodes and shows the toast.
  Because the app is zoneless, that listener callback must write to a signal /
  dispatch through the store to trigger change detection (see the `zoneless-app`
  constraint); a plain callback that mutates a field will not update the UI.
- **The popup owns its own NgRx connections store instance** (provided per-route,
  as today). State does not leak between the popup and the main window except
  through the explicit broadcast.
- **Failure and "save without testing" paths do not broadcast.** Only a
  successful persist signals the main window; a failed test, a cancel, or closing
  the window leaves the tree untouched.
- **Two windows can drift on styling/providers.** The popup route must reproduce
  whatever app-shell providers and global styles the form's `Sbb*` components
  assume, the same way the body-viewer popup and the Storybook preview do.
- **This locks in a `window.open` + `setWindowOpenHandler` contract.** The
  `/popups/` URL prefix is load-bearing (it is how Electron decides to allow the
  window); the add-connection route must live under it.
