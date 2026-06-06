# Domain Glossary

Canonical terms used in the Servicebus Browser codebase. Implementation details
belong elsewhere (READMEs, ADRs, code). This file is a glossary only.

## Workspace

A named, user-selectable container that owns a set of **Connections** and a set
of **Message Pages** (including each page's backing SQLite store, row
selections, column ordering, and tab order). Exactly one Workspace is **active**
at a time; switching workspaces swaps which connections and message pages are
visible.

A Workspace has a stable identity (UUID) separate from its display name. Names
are freely renameable and are not required to be unique; identity never
changes. Workspaces also carry a creation timestamp for informational purposes.

- **Desktop:** Workspaces are created, renamed, and deleted through the UI.
- **Web:** Workspaces are defined exclusively in the web config file; the UI
  only switches between them.

There is no privileged or sentinel "default" Workspace. The initial Workspace
created during migration is named "Default" but can be renamed or deleted like
any other. The application enforces that at least one Workspace exists at all
times, and that the currently active Workspace cannot be deleted (the user must
switch away first).

Switching the active Workspace tears down all in-flight message receivers and
loads belonging to the previous Workspace; if any load is in progress the user
is asked to confirm.

Out of scope for a Workspace: saved filters (no such feature), modification
engine presets, exported action lists (live on disk outside the app), logs,
**Topology** state (derived live from a Connection), **Tasks** (ephemeral job
tracking), and global UI preferences.

## Connection

A configured Service Bus or Event Hub endpoint. Connections are owned by a
single Workspace.

## Message Page

A tab in the message-viewing UI representing one retrieved set of messages from
a queue/topic/subscription. Each Message Page has its own SQLite store
(OPFS-backed), row selection state, and column ordering. Message Pages are
owned by a single Workspace.

## Topology

The live tree of entities reachable through the active Workspace's
**Connections**, derived on demand from each broker (never persisted). Its nodes
are typed: structural nodes (`connection`, the vhost, and grouping folders such
as "Queues"/"Topics") and addressable entity nodes (queue, topic, subscription,
rule, exchange, event hub, consumer group). The **Topology Navigator** is the
sidebar tree that renders it.

## Search Tag

An exact, type-scoped filter token in the Topology Navigator search, rendered as
a chip showing `type: value`. (The `[type: value]` bracket form is only a
notation for describing tags in writing — it is never shown in the UI.) A Tag
binds one value to one entity
node type (e.g. `connection`, `exchange`) and can only be created by selecting a
suggestion — never typed raw. Tags of different types combine by narrowing down
the topology hierarchy (logical AND); at most one Tag per type exists at a time.
_Avoid_: filter, facet, token (in user-facing language, prefer "tag").

## Free Text

The untagged remainder of a Topology Navigator search query: a case-insensitive
substring matched against entity node names, applied within the scope the Tags
establish. The fuzzy counterpart to the exact **Search Tag**.
