/**
 * A Search Tag chip — an exact, type-scoped filter.
 * Created only by selecting an autosuggest suggestion (never typed raw).
 * At most one chip per node type is present in the query at any time.
 *
 * Serialization: `[type: value]`  (internal contract / display only — chips
 * are not copyable and there is no persistence in v1).
 */
export interface SearchChip {
  type: string;
  value: string;
}

/**
 * The full search query: an ordered list of chips PLUS a trailing free-text string.
 */
export interface SearchQuery {
  chips: SearchChip[];
  freeText: string;
}

export const EMPTY_QUERY: SearchQuery = { chips: [], freeText: '' };

/** Serialize a chip to its canonical bracket form, e.g. "[connection: my-conn]" */
export function serializeChip(chip: SearchChip): string {
  return `[${chip.type}: ${chip.value}]`;
}

/** True when the query has no chips and no free text. */
export function isQueryEmpty(query: SearchQuery): boolean {
  return query.chips.length === 0 && query.freeText.trim() === '';
}

/** Structural node types that must never appear as tag keys. */
export const EXCLUDED_TAG_TYPES = new Set(['operational-grouping', 'no-children']);

/**
 * A blended suggestion item shown in the autocomplete dropdown.
 *
 * `kind === 'entity'`     — selecting this creates a chip {type, value}.
 * `kind === 'freeText'`   — selecting this commits the text as trailing free text.
 * `kind === 'truncation'` — non-selectable informational row ("showing N of M").
 */
export type SuggestionItem =
  | { kind: 'entity'; type: string; label: string; groupLabel: string }
  | { kind: 'freeText'; text: string; label: string }
  | { kind: 'truncation'; label: string };

/**
 * A grouped suggestion row passed to PrimeNG AutoComplete when `[group]="true"`.
 */
export interface SuggestionGroup {
  groupLabel: string;
  items: SuggestionItem[];
}

// ── Suggestion helpers ────────────────────────────────────────────────────────

/** Maximum entity items shown per type group before a truncation hint appears. */
export const SUGGESTION_GROUP_CAP = 10;

/**
 * Ranks a list of entity names by relevance to `fragment`:
 *  1. Prefix matches  (name starts with fragment, case-insensitive) — ranked first.
 *  2. Substring matches (name contains fragment but does not start with it) — ranked second.
 * Within each tier the order is alphabetical.
 *
 * When `fragment` is empty every name is treated as a prefix match so the list
 * is returned in alphabetical order.
 */
export function rankByPrefix(names: string[], fragment: string): string[] {
  const f = fragment.toLowerCase();
  const prefix: string[] = [];
  const substr: string[] = [];
  for (const name of names) {
    const n = name.toLowerCase();
    if (f === '' || n.startsWith(f)) {
      prefix.push(name);
    } else {
      substr.push(name);
    }
  }
  prefix.sort((a, b) => a.localeCompare(b));
  substr.sort((a, b) => a.localeCompare(b));
  return [...prefix, ...substr];
}

/**
 * Given a camelCase / PascalCase type key (e.g. `eventHub`, `consumerGroup`)
 * returns a lower-case "flattened" form (`eventhub`, `consumergroup`) suitable
 * for case-insensitive accelerator matching where the user types without spaces.
 */
export function flattenTypeKey(type: string): string {
  return type.toLowerCase();
}

/**
 * Given the user-typed prefix up to (and including) the first colon, extract
 * the intended tag key and return the matching runtime type (from `availableTypes`)
 * or `null` if no match.
 *
 * Matching is done by comparing the flattened forms so that `exchange:` matches
 * `exchange`, `eventhub:` matches `eventHub`, `consumergroup:` matches
 * `consumerGroup`, etc.
 */
export function resolveAcceleratorType(
  keyFragment: string,
  availableTypes: string[],
): string | null {
  const needle = flattenTypeKey(keyFragment);
  return availableTypes.find((t) => flattenTypeKey(t) === needle) ?? null;
}
