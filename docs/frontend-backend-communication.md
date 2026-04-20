# Frontend-Backend Communication

This document describes the architecture for communication between the frontend (Angular) and the backend components in Servicebus Browser.

## Overview

The application uses an abstraction layer to decouple the UI from the specific transport mechanism. This allows the same Angular frontend to operate seamlessly in both the Electron desktop environment and a standard web browser.

The core of this abstraction is the `ApiHandler` interface defined in `libs/api-clients/clients/src/lib/api-handler.ts`.

## The `ApiHandler` Abstraction

All frontend services depend on the following interface:

```typescript
export interface ApiHandler {
  serviceBusManagementDoRequest(requestType: string, request: handling): Promise<unknown>;
  managementDoRequest(requestType: string, request: unknown): Promise<unknown>;
  messagesDoRequest(requestType: string, request: unknown): Promise<unknown>;
}
```

## Communication Variants

### 1. Electron Variant (Desktop App)

In the Electron application (`apps/servicebus-browser-app`), the backend logic runs within the Electron Main Process.

- **Mechanism**: Electron IPC (Inter-Process Communication).
- **Implementation**: `ipcMain.handle` listeners are configured in `apps/serviceblus-browser-app/src/app/events/service-bus.events.ts`.
- **Flow**:
  1. The Renderer process sends an IPC message via a preload script.
  2. The Main process intercepts the call using `ipcMain.handle`.
  3. The request is processed by the embedded `Server` instance.
- **Pros**: Extremely low latency, no network stack overhead, secure local communication.

### 2. Browser Variant (Web Frontend)

In the web frontend (`apps/servicebus-browser-frontend`), the application communicates with a remote or local Express server via standard web protocols.

- **Mechanism**: HTTP/HTTPS REST API.
- **Implementation**: `WebServiceBusApiHandler` found in `libs/api-clients/angular-bindings/src/web-service-bus-api-handler.ts`.
- **Flow**:
  1. The Angular application uses `HttpClient` to send `POST` requests.
  2. Requests are sent to endpoints like `/management/command` or `/messages/command`.
  3. The backend Express server processes the request and returns a BSON-encoded blob.
- **Pros**: Standard web compatibility, works in any modern browser, supports remote hosting.

## Data Serialization

Both variants use **BSON** for data serialization to support complex types (like buffers/binary data) that are difficult to represent in standard JSON.

1.  The backend wraps the result in a BSON object: `{ "result": <data> }`.
2.  The response is returned as a `Blob`.
3.  The `ApiHandler` implementation deserializes the BSON and recursively converts any binary buffers back into `Uint8Array` for frontend compatibility.

## Summary Table

| Feature                      | Electron (Desktop)                | Browser (Web)                     |
| :--------------------------- | :-------------------------------- | :-------------------------------- |
| **Transport**                | IPC (Inter-Process Communication) | HTTP/HTTPS                        |
| **Backend Location**         | Main Process (Same App)           | External Express Server           |
| **Interface Implementation** | `ipcMain` handlers                | `HttpClient` (Angular)            |
| **Primary Benefit**          | Performance & Local Integration   | Accessibility & Standard Web Flow |
