---
status: accepted
---

# Replace PrimeNG with @spartan-ng/brain + Angular CDK behind a bespoke UI layer

PrimeNG announced a move away from its open-source license. Since Servicebus
Browser is an open-source project, staying on future PrimeNG releases is
incompatible with the project, so we are replacing it. We are **not** under a
deadline — the currently-installed PrimeNG (21.x) remains usable under the terms
it was obtained, so the migration is incremental and unrushed.

We chose **`@spartan-ng/brain` + `@angular/cdk`** as the replacement, used
**headless**: brain (and CDK) supply behaviour and accessibility only; we own all
styling in SCSS. We explicitly rejected spartan's *helm* styled layer because it
requires **Tailwind CSS v4**, which we do not want in the codebase. The point of
going headless is to own our styling and layout outright and to make the *next*
UI-library swap cheap.

To actually get that portability, all styled components live in a bespoke
**`libs/shared/ui`** design-system library. Feature libraries import **only** our
wrappers (`SbbButton`, `SbbSelect`, `SbbDialogService`, …) and never import
`primeng`, `@spartan-ng/brain`, or `@angular/cdk` directly — enforced via Nx
module boundaries and ESLint. Wrapper APIs are **opinionated-minimal**, designed
from current call sites rather than mirroring brain's surface, so swapping the
underlying primitive later means re-implementing wrapper internals while feature
libraries stay untouched. Every form control implements `ControlValueAccessor`.

**Sourcing rule:** brain by default (select, checkbox, radio, accordion, tabs,
popover, tooltip, context-menu, dropdown-menu, pagination, date-picker); decay to
CDK for structural primitives brain doesn't supply — **Tree** (topology
navigator), **virtual scroll** + `SelectionModel` (messages data-grid) — and for
service-based needs. Programmatic dialogs (replacing `DynamicDialog` and the
existing confirmation/prompt services) are built on `@angular/cdk/dialog`; toasts
(replacing `MessageService`) are hand-built on CDK Overlay. We do **not** pull in
extra opinionated dependencies (e.g. `ngx-sonner`) — where brain doesn't supply
it, we build it.

## Considered Options

- **Angular Material** — rejected: MIT-licensed and covers Tree/Table/Dialog/
  Snackbar/Datepicker out of the box (the least-effort migration), but it is not
  headless and is hard to restyle away from Material Design. Fails the primary
  goal of owning our styling and staying portable.
- **spartan *helm* (styled layer)** — rejected: requires Tailwind CSS v4, which we
  do not want; also we prefer to own the styling rather than adopt a class-based
  utility framework.
- **brain-only with hand-written SCSS for everything** — this *is* the chosen path;
  the alternative of writing behaviour/a11y ourselves was rejected as needless
  reinvention.

## Consequences

- **Theming is rebuilt as our own token layer.** `@primeuix/themes` (Aura) is
  replaced by a bespoke two-tier `--sbb-*` system: a theme-independent **palette**
  (colour ramps, including the primary brand colour) and **semantic** tokens
  (`--sbb-surface`, `--sbb-text`, `--sbb-border`, …) that flip per theme via the
  native `light-dark()` function. `light-dark()` lives *only* in semantic token
  definitions; components consume `var(--sbb-*)` and stay theme-unaware. Token
  values are seeded from Aura's current computed values so the app is visually
  identical after the swap — we change the machinery, not the design. Any redesign
  is a separate effort afterward.
- **Dark mode goes native.** The `.darkMode` class mechanism is replaced by setting
  `color-scheme` on `:root`; `ThemeService` keeps its three-state (auto/light/dark)
  model but writes `color-scheme` instead of toggling a class. Scattered
  `&.darkMode` SCSS overrides migrate to semantic tokens.
- **~102 `--p-*` references and PrimeNG class-hacks must be migrated** — consuming
  refs become `--sbb-*` tokens; component-internal override refs largely disappear
  because we own the components.
- **`primeng/api` is a logic surface, not just visual** — `MessageService`,
  `ConfirmationService`, `TreeNode`, `MenuItem`, `SelectItem` become our own
  services and models in `libs/shared/ui`.
- **`primeicons` is dropped** in favour of the already-present FontAwesome.
- **Sequencing:** the Topology Tree and messages data-grid are proven as **spikes
  first** (highest regression risk); if a spike can't match current behaviour, that
  is the signal to reconsider that component's approach. Then the primitives lib +
  token layer, then feature-by-feature swap with PrimeNG and `libs/shared/ui`
  coexisting until the last PrimeNG import is removed.
- **Angular 21 note:** apply spartan's utility to disable CDK overlay `usePopover`
  so overlay-based components don't render above `position: fixed` elements.
