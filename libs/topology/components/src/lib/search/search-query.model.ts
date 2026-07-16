/**
 * A Search Tag chip — an exact, type-scoped filter.
 * Created only by selecting an autosuggest suggestion (never typed raw).
 * At most one chip per node type is present in the query at any time.
 *
 * The `[type: value]` bracket form is only a textual notation used in design
 * discussion; it is never rendered (the pill shows `type: value`) and there is
 * no persistence in v1.
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
 * `kind === 'truncation'` — non-selectable informational row ("showing N of M").
 */
export type SuggestionItem =
  | { kind: 'entity'; type: string; label: string; groupLabel: string }
  | { kind: 'truncation'; label: string };

/**
 * A grouped suggestion row passed to AutoComplete when `[group]="true"`.
 */
export interface SuggestionGroup {
  groupLabel: string;
  items: SuggestionItem[];
}

// ── Suggestion helpers ────────────────────────────────────────────────────────

/** Maximum total entity items shown across ALL type groups in the dropdown. */
export const SUGGESTION_TOTAL_CAP = 10;

/**
 * @deprecated Use SUGGESTION_TOTAL_CAP. Kept for any external references.
 * @internal
 */
export const SUGGESTION_GROUP_CAP = SUGGESTION_TOTAL_CAP;

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
