/**
 * Visual intent of the button. Derived from current `p-button` `severity`
 * call sites: primary (default), secondary, danger.
 */
export type SbbButtonSeverity = 'primary' | 'secondary' | 'danger';

/**
 * Visual weight/fill of the button. Derived from current `p-button`
 * `variant="outlined"` / `[text]="true"` call sites.
 *  - `filled`   solid background (default).
 *  - `outlined` bordered, transparent background.
 *  - `text`     no border/background, colored label only.
 */
export type SbbButtonVariant = 'filled' | 'outlined' | 'text';

/** Button size. Derived from current `p-button` `size="small"` call sites. */
export type SbbButtonSize = 'small' | 'medium' | 'large';
