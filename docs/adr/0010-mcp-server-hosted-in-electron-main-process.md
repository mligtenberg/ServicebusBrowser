# MCP server hosted directly in the Electron main process

The desktop app hosts an MCP server directly inside its Electron main process
over HTTP/streamable-HTTP transport, bound to `127.0.0.1` on a
settings-configurable port (fixed sensible default), rather than the more
common MCP pattern of a separate stdio process the client spawns. We picked
this because a stdio process only makes sense when the *client* owns the
server's lifecycle — here the server's whole reason for existing is to reach
into an already-running GUI app's live state (open windows, in-memory broker
connections), so the app itself is the only thing that can host it. The
trade-off: MCP clients that only support spawning stdio servers (not pointing
at a remote/HTTP URL) can't use this integration.

The server is off by default and only starts when the user enables it in
settings, at which point it generates a bearer token; the app then offers a
copy-paste MCP client config snippet (`url` + `Authorization: Bearer` header)
so the user never has to construct one by hand. The token is persisted across
restarts (not regenerated per launch) so the copied snippet stays valid;
regeneration is an explicit user action.

## Consequences

- The tool set is designed to grow additively — window-control tools
  (focus/open a Workspace window, navigate to a Topology node) plus read-only
  data tools ship first; broker-mutating actions (send, complete,
  dead-letter) are intentionally deferred rather than designed out, and
  should be addable as new tools without a transport or auth redesign.
- Every tool call must resolve an explicit `workspaceId` (never an ambient
  "current" workspace) — see the multi-window workspace-routing docs for why
  more than one Workspace can be open across windows at once. Tools that only
  need broker/Connection data run headlessly against the main-process
  `Server`, independent of whether any window is open; tools that inherently
  mean "do something to a window" (focus, navigate) fail with a clear error
  if no window for that Workspace exists, rather than silently opening one.
