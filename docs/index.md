# Servicebus Browser Documentation

Welcome to the documentation for Servicebus Browser. This repository contains information about the architecture, development workflows, and technical details of the project.

## Getting Started

- [Quickstart: Web Version](./quickstart-webversion.md): Step-by-step guide to configure and run the web variant, including the `sbb-connections.json` workspace/connection format and Docker run command.

## Architecture & Design

- [Frontend-Backend Communication](./frontend-backend-communication.md): Details on how the Angular UI communicates with backends via the `ApiHandler` abstraction.
- [Electron vs Browser Variants](./electron-vs-browser.md): Comparison between the desktop and web deployment targets.
- [Desktop Build Process](./desktop-build-process.md): Instructions for building and packaging the Electron application.
- [Web App Build Process](./web-app-build-process.md): Instructions for building, containerizing, and deploying the web application.
- [Event Hub Namespace REST Authentication](./event-hub-namespace-rest-auth.md): SAS token generation and API versioning for Event Hub namespace management calls.
- [Integrated Authentication](./integrated-authentication.md): Interactive Azure sign-in (popup) for Service Bus/Event Hub in the desktop app, using the Azure CLI client id with per-email MSAL token-cache reuse.
- [Messages Reader Continuation Token Behavior](./messages-reader-continuation-token-behavior.md): Cross-broker continuation-token rules to stop message loading exactly at requested limits.
- [Web Backend Config Format](./web-config-format.md): Versioned workspace+connection config file consumed by the web backend, legacy auto-migration, and validation rules.

## Architecture Decision Records

- [ADR-0001: Single active Workspace at a time](./adr/0001-single-active-workspace.md)
- [ADR-0002: Workspace persistence via foreign-key namespacing](./adr/0002-workspace-persistence-foreign-key-namespacing.md)
- [ADR-0003: Hard-cancel active receivers on Workspace switch](./adr/0003-hard-cancel-receivers-on-workspace-switch.md)

## Project Structure

- `apps/`: Main applications (Electron and Web).
- `libs/`: Reusable business logic, UI components, and API clients.
- `docs/`: Architectural documentation and technical guides.
