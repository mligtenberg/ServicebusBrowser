# Headless per-Workspace renderer for Message Page queries

Message Page data (already-retrieved messages, per-page SQLite/OPFS stores in
`libs/messages/messages-db`) only exists inside a renderer process — OPFS is
a browser API, unreachable from the Electron main process. To let MCP data
tools answer questions like "why did messages on page X get dead-lettered"
without requiring the user to keep a visible window open on that Workspace,
the main process lazily creates a hidden (`show: false`) window per
`workspaceId` the first time a tool needs one, backed by a **new, minimal Nx
frontend app** — not the existing full `servicebus-browser-app` renderer —
that reuses the same store/`messages-db` libraries without the router, menu,
or popup-window machinery a visible window needs. Each hidden window is fixed
to one Workspace for its lifetime; a query for a different Workspace gets its
own separate hidden window rather than an existing one switching context, and
each is torn down after 5 minutes of no queries (not configurable).

This is a real lifecycle change: with the MCP server enabled, closing the
last visible window can no longer just quit the app the way
`onWindowAllClosed` does today, since a hidden query window (or the
possibility of one) may still need to exist. A tray icon appears only while
MCP is enabled (never otherwise) with Open/Regenerate-token/Quit actions, and
disappears — reverting to today's quit-on-close behavior — when MCP is
disabled.

## Consequences

- Each active hidden window is a full Angular/NgRx renderer instance with its
  own memory/CPU cost; the 5-minute idle timeout bounds this but a burst of
  queries across many Workspaces will run that many renderers concurrently.
- The new headless app must be kept in sync with how the real app activates
  a Workspace (whatever `WorkspaceSwitchService.activate()` does on boot) —
  it deliberately does *not* reuse the full router/guard path, so that
  activation logic has two call sites going forward.
