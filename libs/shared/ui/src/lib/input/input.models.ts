/**
 * Text-like `<input>` types supported by {@link SbbInput}.
 *
 * Restricted to the subset actually used across current `pInputText` call
 * sites (plain text, search boxes, passwords, emails, and numeric-looking
 * text fields). Not a pass-through of every native `<input type>`.
 */
export type SbbInputType = 'text' | 'password' | 'email' | 'search' | 'number' | 'tel' | 'url';

/** Visual size of {@link SbbInput}, mirrors the current usage (default = normal). */
export type SbbInputSize = 'sm' | 'md' | 'lg';
