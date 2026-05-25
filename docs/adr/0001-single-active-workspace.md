# Single active Workspace at a time

A Workspace scopes the visible Connections and Message Pages. We chose to allow
exactly one active Workspace per app session rather than letting pages from
multiple Workspaces coexist in the tab bar.

The alternative — concurrent multi-Workspace tabs — would make Workspaces a
*filter* over a single global page set rather than a *context* the user
inhabits. That breaks the mental model implied by the menu-bar switcher, makes
connection operations ambiguous ("send to queue X" — which Workspace's X?), and
forces every store and effect to thread workspace context into operations
rather than reading the active Workspace at the boundary.

Single-active keeps the existing `MessagesStore` / `ConnectionsStore` shapes
intact: they always describe the active Workspace, and switching is implemented
as a tear-down + rehydrate cycle rather than a pervasive scoping change. If
real demand for cross-Workspace concurrent viewing emerges later, it can be
added as a layered "compare" mode without inverting the foundation.
