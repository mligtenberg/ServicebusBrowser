/**
 * A labeled group of autocomplete suggestions, for call sites that render
 * grouped results (e.g. the topology tree search groups entities by kind).
 *
 * Consumers define their own item shape `T`; `label` is the group header text
 * and `items` are that group's suggestions.
 */
export interface SbbAutocompleteGroup<T> {
  readonly label: string;
  readonly items: readonly T[];
}
