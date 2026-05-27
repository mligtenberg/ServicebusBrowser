# Web Backend Config Format

The web backend reads a single `sbb-connections.json` file from its working directory. This file defines all workspaces and their connections.

## Versioned format (v1)

```json
{
  "version": 1,
  "workspaces": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Production",
      "connections": [
        {
          "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
          "name": "Primary Namespace",
          "type": "servicebus",
          "target": "servicebus",
          "connectionString": "Endpoint=sb://..."
        }
      ]
    },
    {
      "id": "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
      "name": "Staging",
      "connections": []
    }
  ]
}
```

### Validation rules

The backend validates the config on startup and refuses to serve if any rule is violated:

- Every workspace must have a valid UUID `id` and a non-empty `name`.
- Workspace `id` values must be unique within the file.
- Connection `id` values must be unique **across all workspaces** in the file (not just within one workspace).
- `version` must be `1`.

Unknown extra fields on workspace objects are warned about and ignored (forward-compatible).

## Legacy format (auto-migration)

If the config file is a flat JSON array (the original format before workspaces were introduced), the backend auto-wraps all connections into a single synthetic **"Default"** workspace at read time and emits a deprecation warning in the log:

```json
[
  { "id": "...", "name": "My Connection", "type": "servicebus", ... }
]
```

Migrate by wrapping your connections:

```json
{
  "version": 1,
  "workspaces": [
    {
      "id": "<new-uuid>",
      "name": "Default",
      "connections": [ ... your existing connections ... ]
    }
  ]
}
```

## Active workspace

The web frontend persists the last-selected workspace id in browser `localStorage` under the key `sbb-active-workspace-id`. On boot, the stored id is matched against the workspace list from the backend:

- If it matches a workspace, that workspace becomes active.
- If it is absent or no longer present in the config (e.g. it was removed by the operator), the **first** workspace in the array becomes active.

The active workspace is synced to the backend on boot and on every switch so the backend can filter connections accordingly.

## Workspace management

The web frontend **does not** support creating, renaming, or deleting workspaces. These operations are performed by the operator by editing `sbb-connections.json` and restarting the backend.
