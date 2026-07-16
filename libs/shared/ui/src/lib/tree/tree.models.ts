/**
 * Public data contract for {@link SbbTree}.
 *
 * A node is any object the consumer owns; the tree only needs to know:
 *  - how to identify it (`id`), for stable tracking + expansion state, and
 *  - how to reach its children (`children`).
 *
 * The consumer's own payload rides along untouched and is handed back to the
 * node template via context, so callers never see CDK's internal wrapper types.
 */
export interface SbbTreeNode {
  /** Stable, unique identity for this node (used for tracking + expansion). */
  id: string;
  /** Child nodes. Absent or empty means the node is a leaf. */
  children?: this[];
  /**
   * Whether this node may be selected. Defaults to `true` when omitted.
   * A non-selectable node is still rendered and can still be expanded, but
   * clicking its row never changes the selection, and it is skipped by
   * shift-range selection.
   */
  selectable?: boolean;
}
