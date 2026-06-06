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
 * `kind === 'entity'` — selecting this creates a chip {type, value}.
 * `kind === 'freeText'` — selecting this commits the text as trailing free text.
 */
export type SuggestionItem =
  | { kind: 'entity'; type: string; label: string; groupLabel: string }
  | { kind: 'freeText'; text: string; label: string };

/**
 * A grouped suggestion row passed to PrimeNG AutoComplete when `[group]="true"`.
 */
export interface SuggestionGroup {
  groupLabel: string;
  items: SuggestionItem[];
}
