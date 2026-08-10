# Raw SQL for MCP Message Page queries, safety enforced at the connection level

The MCP `query_message_page`-style tool executes client-supplied raw SQL
against a Message Page's SQLite file, rather than the existing structured
`MessageFilter` model (`libs/messages/messages-db/src/lib/filter-to-where-clause.ts`)
the UI's filter builder already uses. This was a deliberate choice over the
safer alternative: `MessageFilter` has no aggregation (no group-by/count-by),
and models are generally more reliable at writing SQL directly than
constructing its nested, `isActive`-flagged filter JSON correctly — the
flexibility was judged worth the added risk for a feature whose whole point
is ad-hoc, agent-driven analysis questions.

The only safety mechanism is opening the SQLite connection itself in
read-only mode (the `mode=ro` file-URI flag), not statement parsing/rejection
— this blocks all mutation (`UPDATE`/`DELETE`/`DROP`/`PRAGMA writable_schema`,
etc.) at the SQLite engine level regardless of query shape, so there's no
parser to keep in sync with SQLite's grammar. A separate metadata tool
describes a page's queryable shape by returning the existing
`getHeaderPropertyLabels`/`getPropertiesPropertyLabels`/etc. label lists plus
the fixed `messages` table columns — not `PRAGMA table_info` schema
introspection — since that's the same information the UI's own filter
builder already exposes today.

## Consequences

- A query is scoped to exactly one Message Page's own SQLite file (opened via
  the same per-page path convention as the app itself uses); there is no
  cross-page or cross-Workspace SQL surface.
- If aggregation/analysis needs grow, revisit whether `MessageFilter` should
  gain group-by support instead of leaning further on raw SQL — this ADR
  accepted the risk for v1, not as a permanent stance.
