# Servicebus Browser Documentation

Welcome to the documentation for Servicebus Browser. This repository contains information about the architecture, development workflows, and technical details of the project.

## Getting Started

- [Quickstart: Web Version](./quickstart-webversion.md): Step-by-step guide to configure and run the web variant, including the `sbb-connections.json` workspace/connection format and Docker run command.

## Architecture & Design

- [Frontend-Backend Communication](./frontend-backend-communication.md): Details on how the Angular UI communicates with backends via the `ApiHandler` abstraction.
- [Connection Management Actions](./connection-management.md): How connection tree actions (rename, delete) are declared and handled end-to-end, plus the shared `PromptService` text-input dialog.
- [Electron vs Browser Variants](./electron-vs-browser.md): Comparison between the desktop and web deployment targets.
- [Desktop Build Process](./desktop-build-process.md): Instructions for building and packaging the Electron application.
- [Web App Build Process](./web-app-build-process.md): Instructions for building, containerizing, and deploying the web application.
- [Event Hub Namespace REST Authentication](./event-hub-namespace-rest-auth.md): SAS token generation and API versioning for Event Hub namespace management calls.
- [Integrated Authentication](./integrated-authentication.md): Interactive Azure sign-in (popup) for Service Bus/Event Hub in the desktop app, using the Azure CLI client id with per-email MSAL token-cache reuse.
- [Messages Reader Continuation Token Behavior](./messages-reader-continuation-token-behavior.md): Cross-broker continuation-token rules to stop message loading exactly at requested limits.
- [Broker Connection Caching](./broker-connection-caching.md): `IdleTimeoutConnectionCache` keeps each broker's connection warm across paged reads for 60s of inactivity instead of reconnecting per page.
- [Web Backend Config Format](./web-config-format.md): Versioned workspace+connection config file consumed by the web backend, legacy auto-migration, and validation rules.
- [Storybook Component Workbench](./storybook.md): Single Storybook host (`storybook-host`, Vite builder) for the presentational UI layer — addressable story URLs, theming, and the `build-storybook` type/AOT gate.
- [Workspace Lifecycle and NgRx Effects Timing](./workspace-lifecycle-and-ngrx-effects.md): Why effects register before app initializers finish, the `workspaceActivated` action pattern for workspace-dependent startup work, and how tab (page) order persistence works.
- [Multi-Window Workspace Routing](./multi-window-workspace-routing.md): The `:workspaceId` route segment, its activation guards and fallback chain, and (desktop) the main-process window↔workspace registry that focuses an existing window instead of duplicating it.
- [Virtual Scroll Geometry (CDK)](./virtual-scroll-geometry.md): The two invariants the CDK fixed-size strategy silently depends on — a viewport size that is re-measured on element-level resizes, and a row whose outer height equals `itemSize` — and why breaking them makes the last rows of a huge list unreachable.
- [MCP Server (Desktop)](./mcp-server.md): Implementation of ADR-0010's in-process MCP server — settings storage, the HTTP host, the tool set (including the ADR-0011/0012 headless-renderer Message Page query tools), tray icon lifecycle, and what's still deferred.

## Architecture Decision Records

- [ADR-0001: Single active Workspace at a time](./adr/0001-single-active-workspace.md)
- [ADR-0002: Workspace persistence via foreign-key namespacing](./adr/0002-workspace-persistence-foreign-key-namespacing.md)
- [ADR-0003: Hard-cancel active receivers on Workspace switch](./adr/0003-hard-cancel-receivers-on-workspace-switch.md)
- [ADR-0004: Topology Navigator search uses an autosuggest-only chip model](./adr/0004-topology-search-chip-model.md)
- [ADR-0005: RabbitMQ vhost gets a dedicated topology node type](./adr/0005-vhost-dedicated-node-type.md)
- [ADR-0006: Replace PrimeNG with @spartan-ng/brain + Angular CDK behind a bespoke UI layer](./adr/0006-replace-primeng-with-spartan-brain-cdk.md)
- [ADR-0007: Storybook as an AI-facing component workbench (Vite builder)](./adr/0007-storybook-ai-component-workbench.md)
- [ADR-0008: Add-connection form runs in a separate popup window, not an in-app modal](./adr/0008-add-connection-popup-window.md)
- [ADR-0009: Workspace id becomes a URL route segment](./adr/0009-workspace-id-in-url.md)
- [ADR-0010: MCP server hosted directly in the Electron main process](./adr/0010-mcp-server-hosted-in-electron-main-process.md)
- [ADR-0011: Headless per-Workspace renderer for Message Page queries](./adr/0011-headless-per-workspace-renderer-for-message-page-queries.md)
- [ADR-0012: Raw SQL for MCP Message Page queries, safety enforced at the connection level](./adr/0012-raw-sql-message-page-queries-with-readonly-connections.md)

## Project Structure

- `apps/`: Main applications (Electron and Web).
- `libs/`: Reusable business logic, UI components, and API clients.
- `docs/`: Architectural documentation and technical guides.
