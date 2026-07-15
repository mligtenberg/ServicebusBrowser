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
