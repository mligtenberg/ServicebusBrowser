# Servicebus Browser Agent Instructions

## Project Overview

Servicebus Browser is an Nx monorepo containing Angular and Electron applications, as well as shared libraries for topology and logs management. It uses Express for the backend components.

## Tech Stack

- **Monorepo Tooling**: Nx, PNPM
- **Frontend**: Angular 21, Electron
- **Backend**: Express
- **State Management**: NgRx (implied by store/actions/effects structure)
- **Testing**: Jest
- **Linting**: ESLint

## Project Structure

- `apps/`: Contains main applications:
  - `servicebus-browser-app`: Electron-based desktop application.
  - `servicebus-browser-web-frontend`: Web-based frontend.
- `libs/`: Reusable domain libraries:
  - `topology/store`: Store for managing topology state.
  - `logs/store`: Store for managing logs state.
  - `actions-framework`: Framework for handling actions within the app.
  - `api-clients/angular-bindings`: Angular bindings for API clients.
- `assets/`: Static assets and logos.
- `docs/`: Documentation for architectural patterns, technical details, and workflows.

## Memory Bank & Documentation (The `docs/` folder)

All agents must maintain a "Memory Bank" within the `docs/` directory to ensure continuity and knowledge retention.

### Rules for `docs/`

- **Continuous Discovery**: Whenever an agent discovers new architectural patterns, technical details, or workflows, it MUST document them in the `docs/` folder.
- **Structure & Naming**: Markdown files must be named descriptively (e.g., `architecture.md`, `auth-flow.md`).
- **The Index (`docs/index.md`)**: A central `docs/index.md` file must exist and serve as the entry point. It must contain a list of all documentation files with a short description of what each file covers.
- **Consultation First**: Before performing any coding task or making changes, agents MUST consult the existing documentation in `docs/` to gather relevant context and avoid redundant work.
- **Completeness**: If an agent realizes documentation is missing for a discovered component or process, it is responsible for creating that document.

## Development Workflow

### Package Management

Use `pnpm` for all package-related tasks.

- Install dependencies: `pnpm install`

### Running Tasks via Nx

- List all projects: `pnpm exec nx show projects`
- Run a specific target: `pnpm exec nx run <project>:<target>`
- Run tests for a project: `pnpm exec nx run <project>:test`
- Run linting for a project: `pnpm exec nx run <project>:lint`
- Build a project: `pnpm exec nx run <project>:build`
- Run multiple targets across the workspace: `pnpm exec nx run-many -t <target>`
- Start the desktop application flow: `pnpm exec nx run-many -t serve`

### Coding Standards & Best Practices

- **Small Changes**: Prefer small, focused changes within app or library boundaries.
- **Nx Boundaries**: Follow existing Nx project boundaries and naming conventions.
- **Library Integrity**: When modifying libraries in `libs/`, preserve public exports and check for downstream impacts.
- **App Modifications**: When changing code in `apps/`, review nearby `project.json`, `tsconfig*`, and `README` files.
- **Root Cause Fixes**: Always prefer fixing the root cause rather than patching symptoms.
- **Documentation**: Keep READMEs and documentation updated alongside any behavioral changes.
- **Git Hygiene**: Respect `.gitignore`. If a new artifact is generated, update `.logtree` in the same commit.

## Testing & Validation

- Validate changes using project-scoped checks: `pnpm exec nx run <project>:test` or `pnpm exec nx run <project>:lint`.
- Avoid running broad workspace commands unless necessary to minimize execution time.
