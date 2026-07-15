---
status: accepted
---

# Storybook as an AI-facing component workbench (Vite builder)

We want a place to render the presentational UI layer (`libs/shared/ui` and the
stateless components in `libs/shared/components`) in isolation. The **primary
consumer is AI agents**, not a human clicking through a manager: an agent needs a
stable, addressable URL for a component in a known state so it can navigate
there, read the DOM and computed styles, toggle theme, interact, and fix
problems. Isolated per-state rendering is exactly what Storybook provides, and
each story gets a deterministic id (`Shared UI/Button` -> `shared-ui-button--primary`)
that an agent can construct directly against `iframe.html`, bypassing the manager
chrome, with theme as a URL global (`&globals=theme:dark`).

Scope is limited to **presentational components**. Connected components
(`messages/flow`, `management-flow`) would need mocked NgRx store / service /
router providers per story; that cost is deferred until the presentational
workbench proves out.

A single **dedicated host project** (`apps/storybook-host`) owns `.storybook/`
and the `storybook` / `build-storybook` targets; stories stay colocated with
their components and are globbed from both libs. `build-storybook` compiles each
story and its imported components through the Angular compiler, so it doubles as
a **type/AOT check** for the components that have stories — a gap `shared-ui`'s
jest/lint deliberately skip.

We chose the **Vite framework (`@storybook/angular-vite`)** over the Webpack
framework for faster HMR in the agent iterate-fix loop, accepting that it is
newer and hand-wired rather than scaffolded by the Nx generator.

## Considered Options

- **Webpack framework (`@storybook/angular`)** — rejected: the Nx generator
  scaffolds it and it is the more battle-tested Angular path, but its HMR is
  slower, which matters for a workbench whose whole point is a tight
  edit-render-inspect loop.
- **A hand-rolled "kitchen-sink" demo route in the web app** — rejected: no
  per-state isolation, no stable per-component URLs, and it drags in the app's
  full provider graph (store, router, auth). Storybook gives addressable
  isolation for free.
- **One Storybook per library + composition** — rejected: for a two-library
  scope it is more moving parts than a single host with a broad stories glob, and
  an agent would have to know which instance hosts which component.
- **Attaching the config to `shared-ui`** instead of a dedicated host — rejected:
  a dedicated project keeps Nx boundaries clean (no implicit `shared-ui` ->
  `shared/components` build coupling) at the cost of one extra project.

## Consequences

- **Vite 8 enters the workspace as a devDependency.** Storybook's Vite framework
  requires Vite >= 8, while Angular's own dev-server (`@angular/build`) pins Vite
  7 **nested**. The two coexist under pnpm — the root Vite 8 is resolved only by
  Storybook and does not disturb Angular builds. Additional devDeps the framework
  needs: `@analogjs/vite-plugin-angular`, `@angular-devkit/architect` (pinned to
  the Angular-21 line, `0.2102.x`, not the newer default the resolver first
  picked), and `zone.js` (peer, though the app runs zoneless).
- **The preview must reproduce the app shell manually.** `preview.ts` wires
  `provideZonelessChangeDetection()` (the app is zoneless — without it,
  signal-driven CD would not update stories) and loads the global styles the
  components assume: `primeicons`, CDK `overlay-prebuilt.css` (overlays render
  unpositioned without it), and the `--sbb-*` token layer. Theme is applied the
  same way `ColorThemeService` does it — by setting `color-scheme` on `<html>`,
  since semantic tokens use CSS `light-dark()`.
- **Compodoc is disabled** (`framework.options.compodoc: false`); autodocs come
  from explicit per-story `argTypes` plus `input()` inference. Enabling it later
  means adding `@compodoc/compodoc`.
- **Stories must supply complete default `args`** when their `render` template
  binds every input, because a signal `input()` uses its default only when not
  bound at all — an unset arg binds `undefined` and clobbers the default. This is
  documented in `docs/storybook.md` as the main authoring gotcha.
- **This is not visual-regression or CI-gated interaction testing.** Those remain
  possible additions (the stories are reusable as fixtures) but were explicitly
  out of scope: the agent does the interacting live.
