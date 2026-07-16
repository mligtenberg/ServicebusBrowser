/**
 * A single selectable option for `SbbSelect`.
 *
 * Consumers define their own option shape rather than reusing * `SelectItem` — `label` drives the trigger/list text, `value` is the raw
 * value written back through `ControlValueAccessor`, `disabled` skips the
 * option during keyboard navigation and selection.
 */
export interface SbbSelectOption<T> {
  readonly label: string;
  readonly value: T;
  readonly disabled?: boolean;
}

/**
 * A labeled group of options, for call sites that render grouped lists
 * (e.g. the messages grid column picker groups columns by category).
 */
export interface SbbSelectOptionGroup<T> {
  readonly label: string;
  readonly options: readonly SbbSelectOption<T>[];
}

/** Either a flat list of options, or a list of labeled option groups. */
export type SbbSelectOptions<T> =
  | readonly SbbSelectOption<T>[]
  | readonly SbbSelectOptionGroup<T>[];

/** Narrows an `SbbSelectOptions<T>` value to whether it is grouped. */
export function isSbbSelectOptionGroup<T>(
  entry: SbbSelectOption<T> | SbbSelectOptionGroup<T>,
): entry is SbbSelectOptionGroup<T> {
  return (
    Array.isArray((entry as SbbSelectOptionGroup<T>).options) &&
    !('value' in entry)
  );
}
