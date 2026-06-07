# Connection Management Actions

Connections are the root nodes of the topology tree. Each connection node exposes
actions (rendered in the tree context menu / action list) under the `connection`
action group. These actions are injected by the server layer and handled by
action handlers registered in the connections store.

## Available actions

| Action type          | Where declared                                                                          | Handler                                  |
| -------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------- |
| `connection:rename`  | `libs/backend/server/src/lib/management/topology-actions.ts` (`injectConnectionMutationActions`) | `libs/connections/store/src/index.ts`    |
| `connection:delete`  | `libs/backend/server/src/lib/management/topology-actions.ts` (`injectConnectionMutationActions`) | `libs/connections/store/src/index.ts`    |

Both actions carry `connectionId` and `connectionName` parameters. They are
injected uniformly at the server level for **all** connection types, so every
connection can be renamed or deleted regardless of broker — including when the
broker is unreachable. When the connection cannot be reached, `listTopologies`
returns a minimal fallback root node (`errored: true`) that still carries these
actions.

### Read-only stores (web variant)

`connection:rename` and `connection:delete` mutate the stored connection, so they
are meaningless when the connection store is read-only (the web backend uses
`ReadonlyConfigFileConnectionStorage`). A store advertises this via the optional
`isReadonly` flag on the `ConnectionStore` interface, surfaced as
`ConnectionManager.connectionsReadonly`. When that flag is set, `listTopologies`
and `refreshTopology` (`libs/backend/server/src/lib/management/topology-actions.ts`)
strip these mutation actions from the connection root nodes before returning them,
so they never appear in the web UI. The desktop store leaves `isReadonly`
unset (mutable), so both actions remain.

## Rename flow (end-to-end)

1. **Topology provider** emits a `connection:rename` action for the connection node.
2. **Action handler** (`connection:rename` in `libs/connections/store/src/index.ts`)
   opens a text prompt (see `PromptService` below) seeded with the current name,
   then calls `ManagementFrontendClient.renameConnection(id, name)` and dispatches
   `TopologyActions.loadTopologyRootNodes()` to refresh the tree.
3. **Frontend client** issues the `renameConnection` management request
   (`libs/api-clients/clients/src/lib/management-frontend-client.ts`).
4. **Backend action** `renameConnection` (`libs/backend/server/src/lib/management/connections-actions.ts`)
   delegates to `ConnectionManager.renameConnection`, which calls the
   `ConnectionStore.renameConnection(id, name)` interface method and evicts the
   cached connection client so it is rebuilt with the new connection.

### Store implementations

- **Electron** (`SecureConnectionStorage`): reads, updates only the `name` field
  (preserving credentials and `workspaceId`), and re-encrypts the connections file.
- **Web backend** (`ReadonlyConfigFileConnectionStorage`): throws — the web variant
  is read-only, consistent with `addConnection`/`removeConnection`.

## PromptService (shared component)

`PromptService` (`@service-bus-browser/shared-components`) is the text-input
counterpart to `ConfirmationService`. It opens a PrimeNG dynamic dialog
(`PromptDialogBody`) with a single text input and resolves with the trimmed
string, or `undefined` if cancelled. Use it whenever a single line of text is
needed from the user (e.g. renaming).
