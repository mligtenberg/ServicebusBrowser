# Topology Navigator search uses an autosuggest-only chip model

The Topology Navigator search is a chip/token input rather than a plain text
filter. **Tags** — exact, type-scoped filters serialized as `[type: value]` —
can only be created by selecting an autosuggest suggestion, are rendered as
atomic non-editable, non-copyable chips, and combine by narrowing down the
topology hierarchy (always AND, at most one chip per node type). Free text
typed alongside the chips is a case-insensitive substring match over entity
names, applied within the scope the chips establish.

We chose this over a literal-bracket text box (where the user types
`[connection: x]` as raw characters) because making chips the only producer of
tags eliminates a whole class of parser edge cases — unbalanced brackets,
escaping `]`/`:` inside values, malformed half-typed tags — and guarantees
every tag references a real, currently-loaded entity. The trade-off is a more
complex suggestion builder and chip-management UI versus a regex over a text
field. The bracket grammar still exists purely as the serialization contract
between the raw value and the chip model; chips are deliberately not copyable so
serialized strings never need to be re-parsed back into chips (no persistence or
shareable-URL support in v1).

The set of available tag keys is derived **at runtime** from the distinct node
`type`s present in the loaded topology, excluding structural
`operational-grouping` nodes — so the keys automatically track which brokers and
entity types are actually connected, with no hardcoded list. In the
endpoint-selector dialog the search composes (AND) with the existing
selectability filter, so suggested keys and values are derived from the
already-filtered, selectable subset only.

## Considered Options

- **Literal-bracket text box** — rejected: brittle parsing, allows tags that
  reference nothing, and surfaces malformed-query states to the user.
- **Hardcoded tag-key list** — rejected: would drift from the actual node-type
  taxonomy and need editing whenever a broker or entity type is added.
