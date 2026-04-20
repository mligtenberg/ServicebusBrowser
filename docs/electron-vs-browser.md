# Electron vs Browser Variants

This document outlines the architectural differences and shared elements between the two primary deployment targets of Servicebus Browser: the Electron desktop application and the Web frontend.

## Overview

While both variants share a common core UI (built with Angular), they differ significantly in their execution environment, backend integration, and system-level capabilities.

## Shared Elements

Despite their differences, several key components are shared across both variants to maintain a single codebase:

- **Core UI Components**: All business logic, views, and user flows are defined in the `libs/` directory (e.g., `main-ui`, `topology-store`, `messages-flow`) and used by both apps.
- **Business Logic & State Management**: Both use **NgRx** for state management, ensuring consistent application behavior regardless of the platform.
- **API Abstraction (`ApiHandler`)**: As detailed in [frontend-backend-communication.md](./frontend-backend-communication.md), the `ApiHandler` interface allows the UI to remain agnostic of the communication protocol.
- **Data Models**: Shared contracts and types (e.g., `api-contracts`, `shared-contracts`) are used by both variants for type safety during data processing.

## Key Differences

| Feature                    | Electron App (`apps/servicebus-browser-app`)                                                               | Web Frontend (`apps/servicebus-browser-frontend`)                      |
| :------------------------- | :--------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------- |
| **Environment**            | Native Desktop Environment (Node.js + Chromium)                                                            | Standard Web Browser (Chrome, Firefox, etc.)                           |
| **Backend Integration**    | Embedded `Server` running in the Electron Main Process.                                                    | Communicates with a standalone Express server via HTTP.                |
| **System Access**          | Can access local filesystem, native OS APIs, and system resources directly via Node.js.                    | Restricted by Browser Sandbox; limited to web-standard APIs.           |
| **Communication Protocol** | Electron IPC (Inter-Process Communication).                                                                | Standard HTTP/HTTPS REST API.                                          |
| **Deployment**             | Distributed as an executable installer (e.g., `.dmg`, `.exe`).                                             | Deployed as static assets on a web server (Nginx, Apache, etc.).       |
| **Networking**             | Can use custom protocols (e.g., `app://`) and intercept network requests via Electron's `protocol` module. | Restricted to standard web protocols (HTTP/HTTPS) and subject to CORS. |

## Architectural Summary

The **Electron variant** is optimized for a "local-first" experience, providing high performance and deep integration with the host operating system. It is ideal for power users who need direct access to local resources or complex network configurations.

The **Web variant** is designed for accessibility and ease of deployment, allowing any user with a web browser to interact with the Service Bus without installation. It follows standard web architectural patterns.
