# Workspace id becomes a URL route segment

Every window's active Workspace moves from `?openWorkspaceId=` (a boot-only
query param explicitly kept off the hash route, per
[multi-window-workspace-routing.md](../multi-window-workspace-routing.md)) plus
a single shared `localStorage` value, into a `:workspaceId` route segment
(`/<workspaceId>/messages/...` on web, `#/<workspaceId>/messages/...` on
desktop) that wraps the Workspace-scoped routes (`messages`,
`manage-service-bus`, Home) — `popups`, `about`, and (web) `oidc-callback`/
`login-failed` stay unprefixed. `localStorage`'s `sbb-active-workspace-id` is
demoted to a fallback: it's read only when a window loads with no
(or an unknown/deleted) workspace id in the URL, and it's written only on
explicit activation (switcher-driven in-place switch, or an explicit
open-workspace/new-window action) — never just because a window happens to be
sitting open on a workspace. The `:workspaceId` param is live: changing it by
any means (address bar edit, browser back/forward) runs the same tear-down/
rehydrate as an explicit switch, always resetting to the workspace's default
route rather than trying to preserve a sub-route that may not exist in the new
Workspace.

## Consequences

- Bookmarking or sharing a window's URL now reopens the same Workspace,
  including across the web app's config-defined Workspace list, where ids can
  be restructured on redeploy; an unresolvable id falls back to the same path
  as no id at all (last-active, else first Workspace).
- Deliberately **not** guarded: a plain "New Window" (no explicit Workspace
  requested) or a direct URL edit that happens to resolve to a Workspace
  already open in another desktop window is not focus-checked against the
  `workspace-window-registry` and can duplicate it. Only the switcher's
  explicit open-workspace flow and its "New Window" action are checked. This
  is a conscious scope limit, not an oversight — revisit if duplication proves
  a real problem in practice.
- `multi-window-workspace-routing.md` describes the pre-this-decision
  `?openWorkspaceId=` mechanism and needs a rewrite once the route-segment
  implementation lands.
