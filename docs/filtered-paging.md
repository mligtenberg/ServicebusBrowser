# Filtered Paging (the filter index)

The messages grid is lazily paged: `SbbDataGrid` asks for the window of rows it
is about to render, and `MessagesPageComponent.loadRows()` fetches exactly that
window from the page's SQLite file. Random access is the whole point — the user
can drag the scrollbar to row 400.000 of a 700k-message page.

## Why `LIMIT/OFFSET` cannot serve a filtered page

Without a filter, `... ORDER BY id ASC LIMIT 100 OFFSET 400000` is cheap:
`messages.id` is the primary key, so SQLite walks its index and skips 400.000
entries without ever touching a row. Measured on a 700k / 2.3 GB page: **0.19 s**.

Add a filter and the plan becomes `SCAN messages USING INDEX
sqlite_autoindex_messages_1`: every skipped row has to be *read* and tested
against the predicate (`body LIKE ?`, an `EXISTS` on a property table, …). The
cost is then linear in the offset:

| offset | filtered `LIMIT 100 OFFSET n` |
| ------ | ----------------------------- |
| 0      | 0.01 s                        |
| 20.000 | 1.9 s                         |
| 40.000 | 4.2 s                         |

That is native SQLite with a warm page cache; through sqlite-wasm on OPFS it is
considerably worse. Because the wasm worker serializes statements, scrolling
also *queues* these queries, so each new window waits behind the ones the user
scrolled past. Past roughly 30.000 filtered rows the grid rendered nothing but
empty rows, with values popping in at random much later — the requests were
never lost, just arbitrarily slow.

## The fix: materialize the filtered id list once

`SqliteMessagesDatabase` keeps a temp table on its connection:

```sql
CREATE TEMP TABLE filterIndex (rowIndex INTEGER PRIMARY KEY, id TEXT NOT NULL);
INSERT INTO filterIndex (id) SELECT id FROM messages <where> ORDER BY id ASC;
```

`rowIndex` is the rowid, so consecutive inserts number the matching rows
`1..N` — i.e. it *is* the row's position in the filtered result set. A page read
then seeks instead of scanning:

```sql
SELECT m.message FROM filterIndex f JOIN messages m ON m.id = f.id
WHERE f.rowIndex > :skip ORDER BY f.rowIndex ASC LIMIT :take
```

Constant time (0.000 s at any position, verified against the 700k page). The
one-off build costs a single filtered scan — the same scan `countMessages()`
already paid for the filtered-count badge, which is why the count now comes from
`SELECT COUNT(*) FROM filterIndex` (once per build, then cached against the
signature) rather than a second scan of `messages`. Applying a filter therefore
still costs one scan before the first row appears; every scroll afterwards is
free.

SQL construction lives in
[`filter-index-sql.ts`](../libs/messages/messages-db/src/lib/filter-index-sql.ts)
with unit tests next to it; the predicate itself still comes from
`getWhereClause()`, so filter semantics are unchanged.

## Invariants to preserve

- **One index at a time.** There is a single table, so builds and reads are
  serialized through `filterIndexQueue`. A read must never be issued outside
  that queue, or it can land on another filter's index.
- **The signature decides rebuilds.** `filterIndexSignature()` covers the
  filter, the selection keys and `messagesVersion` (bumped by every
  `addMessages()`), so an index built while a page was still loading is
  discarded. It deliberately does *not* cover the sort direction: the index is
  always ascending, and a descending page is read backwards from
  `rowIndex <= total - skip`. Adding direction to the signature would make an
  ascending count and a descending read rebuild each other on every call.
- **`temp_store = MEMORY`** is set in `doInitialize()`. Temp storage must not
  need a temp *file* — the OPFS VFS has nowhere to put one. Budget roughly
  700k × ~30 bytes if a filter matches an entire large page.
- **Keyset walks stay on the old path.** `walkMessagesWithCallback()` pages by
  `id > lastKey`, which is already linear overall, and is used by export/resend
  rather than by random access.
- The index is per *connection*. The MCP headless renderer (ADR-0011) opens its
  own, so a write it makes is not visible to the app window's
  `messagesVersion`; today only the app writes messages.
