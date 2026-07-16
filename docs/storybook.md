# Storybook — Component Workbench

A single Storybook instance renders the presentational UI layer in isolation.
Its primary purpose is to give **agents (and humans) a stable, addressable place
to see a component in a known state, inspect its DOM/computed styles, and
interact with it** while diagnosing and fixing problems.

## What's in scope

Presentational components only:

- `libs/shared/ui` — the `sbb` component library
- `libs/shared/components` — stateless components (e.g. `duration-input`)

Connected components (`messages/flow`, `message-brokers/.../management-flow`) are
deliberately **out of scope** — they need mocked NgRx store / services / router
providers per story. If that changes, add mocked providers in `preview.ts` and
extend the `stories` glob in `main.ts`.

## Where it lives

A dedicated host project, `storybook-host` (under `apps/`), owns the config;
stories stay colocated with their components (`*.stories.ts` next to the
`.ts`/`.html`/`.scss`).

```
apps/storybook-host/
  project.json                 storybook + build-storybook targets (nx:run-commands)
  .storybook/
    main.ts                    framework + stories glob (globs BOTH libs)
    preview.ts                 providers, global styles, theme decorator
    preview-styles.scss        --sbb-* tokens + base font
    tsconfig.json              scopes stories for the Angular compiler
```

## Running it

```bash
pnpm exec nx run storybook-host:storybook         # dev server, port 6006
pnpm exec nx run storybook-host:build-storybook   # static build -> dist/storybook/storybook-host
```

`build-storybook` compiles every story and its imported components through the
Angular compiler, so it doubles as a **type/AOT check** for the components that
have stories — a safety net `shared-ui`'s jest/lint skip (they don't
type-check). Coverage grows as stories are added.

A `.claude/launch.json` entry named `storybook` lets the in-app browser boot it
via `preview_start`.

## Builder

`@storybook/angular-vite` (Storybook 10, Vite 8). Chosen over the Webpack
framework for faster HMR. Because Angular's own dev-server pins Vite 7 nested,
a root Vite 8 devDependency (for Storybook) does not disturb Angular builds.
Extra devDeps required by the framework: `@analogjs/vite-plugin-angular`,
`@angular-devkit/architect` (pinned to the Angular-21 line, `0.2102.x`),
`zone.js`, `vite@^8`. Compodoc is disabled (`framework.options.compodoc: false`).

## Conventions for agents

Story ids are derived from the `title`, kebab-cased:

| Story `title`          | id prefix          |
| ---------------------- | ------------------ |
| `Shared UI/Button`     | `shared-ui-button` |

So a single story is addressable directly, bypassing the manager chrome:

```
http://localhost:6006/iframe.html?id=shared-ui-button--primary
http://localhost:6006/iframe.html?id=shared-ui-button--primary&globals=theme:dark
```

**Theme** is a URL-addressable global (`&globals=theme:light|dark|auto`,
default `light`). It sets `document.documentElement.style.colorScheme`, exactly
how `ColorThemeService` drives the app — semantic `--sbb-*` tokens are built with
CSS `light-dark()`, so no class/attribute toggling is involved.

### Authoring gotcha

The app is **zoneless** (`provideZonelessChangeDetection()` is wired in
`preview.ts`). When a story's `render` template binds every input
(`[variant]="variant"` …), give the meta a complete default `args` object.
A signal `input()` falls back to its default only when it is **not bound at
all**; binding an unset arg passes an explicit `undefined` and clobbers the
default (e.g. a missing `variant` drops the `sbb-button--filled` class and the
button renders with fallback colors).

## Automated tests (`@storybook/addon-vitest`)

Every story doubles as a Vitest test — a real Chromium instance (via
Playwright's browser mode) renders the story and, if the story has a `play`
function, runs it. This replaces manual browser-driven checks (navigating to
a story, clicking around, reading the DOM) for anything that's checked more
than once: the automation cost is paid once, instead of every time on every
future check.

```bash
pnpm exec nx run storybook-host:test        # runs every story as a test
```

Add a `play` function to a story to assert interaction behavior, using
`storybook/test` (a re-export of Testing Library + Vitest's `expect`):

```ts
import { expect, fireEvent, waitFor, within } from 'storybook/test';

export const InsidePopover: Story = {
  // ...
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fireEvent.click(canvas.getByRole('button', { name: 'Open popover' }));
    await waitFor(() => expect(canvas.getByText('...')).toBeVisible());
  },
};
```

See [context-menu.component.stories.ts](../libs/shared/ui/src/lib/context-menu/context-menu.component.stories.ts)'s
`InsidePopover` story for a full example (asserts that choosing a context-menu
item doesn't light-dismiss the surrounding popover).

### Gotchas

- **`waitFor` around `toBeVisible()` on anything with a CSS animation.**
  `toBeVisible()` reads computed `opacity` synchronously. `SbbPopover`'s panel
  runs a `sbb-fade-in` opacity animation on open, so a bare
  `expect(el).toBeVisible()` right after triggering an open can catch the very
  first animation frame (`opacity: 0`) and fail — not a real bug, just an
  assertion racing the animation. Wrap it in `waitFor(() => expect(...))`.
- **Never invoke `vitest` via `pnpm exec` from inside `apps/storybook-host`.**
  That directory has no local `package.json`, so `pnpm exec` silently resets
  the working directory to the workspace root before running the binary —
  `vitest.config.ts` then fails to load (or loads the wrong one), execution
  falls back to Vitest's default test discovery, and it silently runs every
  Jest `*.spec.ts` in the whole monorepo instead of the story files (they
  all fail with `ReferenceError: describe is not defined`, since Jest globals
  aren't injected). Always go through the Nx target
  (`nx run storybook-host:test`, backed by `nx:run-commands` with an explicit
  `cwd`) — Nx spawns the binary directly without pnpm's cwd remap.
- All 9 story files have `play`-function interaction coverage as of writing;
  expanding coverage further is just adding more stories/assertions as new
  components arrive.
- **`fireEvent.click` on a disabled native `<button>` still invokes
  listeners.** A raw `dispatchEvent` bypasses the browser's disabled-element
  suppression, which only applies to trusted/real clicks. Use
  `userEvent.click` instead when asserting a disabled control does *not*
  respond, or you'll get a false failure — see the `Disabled`/`Loading`
  stories in [button.stories.ts](../libs/shared/ui/src/lib/button/button.stories.ts).

## Accessibility checks (`@storybook/addon-a11y`)

Every story is also linted for accessibility violations (axe-core) as part of
the same Vitest run, via `parameters.a11y` in `preview.ts`. Currently set to
`test: 'todo'` — violations are recorded but don't fail the test, since the
app has known, pre-existing gaps (see below). Flip it to `test: 'error'` once
those are cleared, to make new a11y regressions actually fail CI.

Known gap (found via the interaction tests above, not yet fixed): `SbbButton`
doesn't forward a host-level `aria-label` to its inner native `<button>`, so
icon-only buttons using `<sbb-button aria-label="...">` (split-button's
toggle, input-group's remove/clear/search buttons) have no accessible name on
the real interactive element. Tracked as a follow-up, not fixed here.
