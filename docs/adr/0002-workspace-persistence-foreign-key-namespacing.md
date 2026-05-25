# Workspace persistence via foreign-key namespacing

Workspace ownership of Connections and Message Pages is recorded by adding a
`workspaceId` to existing records, not by partitioning storage into one
file/database per Workspace. Concretely:

- `sbb-connections.json` (desktop, encrypted) stays a single file; each
  Connection gains a `workspaceId`.
- `pages.sqlite3` (OPFS) stays a single database; the `pages` table gains a
  `workspaceId` column.
- `pagesOrder` in `localStorage` becomes `{ [workspaceId]: string[] }`.
- A new `sbb-workspaces.json` (encrypted, versioned) holds the Workspace
  registry and last-active id.
- The per-page message SQLite files **are** physically partitioned by
  Workspace: `sqlite/{workspaceId}/{pageId}.sqlite3` in OPFS. This is purely
  operational — deleting a Workspace becomes "drop the directory" rather than
  iterating page ids to unlink files. The directory name is the workspace UUID,
  never the display name (names are renameable; identity is not).

The rejected alternative was file-per-Workspace partitioning of *every* store
(`sbb-connections-{wsId}.json`, `pages-{wsId}.sqlite3`). It would give "hard"
isolation, but Workspaces are not a security boundary (same user, same
machine), and the partitioned model makes future cross-Workspace operations
(move/import/export) into multi-file dances instead of single-row updates. It
also multiplies the number of files the encryption layer and migration logic
must track.

Connection and Page IDs remain **globally unique UUIDs**, not unique within a
Workspace. This means a future "move connection between Workspaces" feature is
a `WHERE id = ?` UPDATE rather than a re-key, and no per-page SQLite file can
collide across Workspaces even if the subdirectory layout were ever flattened.
