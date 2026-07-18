# Quickstart Guide for Web Version

## Creating the app registration
Create a new app registration in the Azure portal with the following settings:
- Authentication:
  - Platform type: Single-page application
  - Redirect URI: `https://<service-bus-browser-hostname>`

It is recommended to enable "Assignment required" in the connected enterprise application settings.
To do this:
- Navigate to the enterprise application via the overview page of the app registration.
- Select the link under the "Managed application in local directory" header.
- In the "Properties" section, set "User assignment required?" to "Yes".

## Configure the app

Create two files before running the container:

### `openid-config.json`
Passed directly to the [`angular-auth-oidc-client`](https://angular-auth-oidc-client.com/) library.
See their [configuration docs](https://angular-auth-oidc-client.com/docs/documentation/configuration) for all options.

Template for Microsoft Entra:
```json
{
  "authority": "https://login.microsoftonline.com/{tenantId}/v2.0",
  "clientId": "{clientId}",
  "scope": "openid profile api://{clientId}/access",
  "responseType": "code",
  "silentRenew": true,
  "maxIdTokenIatOffsetAllowedInSeconds": 600,
  "issValidationOff": true,
  "autoUserInfo": false,
  "strictIssuerValidationOnWellKnownRetrievalOff": true,
  "useRefreshToken": true,
  "customParamsAuthRequest": {
    "prompt": "select_account"
  }
}
```
Make sure the `requestedAccessTokenVersion` in the app registration manifest is set to `2`.

### `sbb-connections.json`
Defines the workspaces and connections shown in the UI. The operator owns this file — the web frontend is read-only and cannot create, rename, or delete workspaces.

#### Format (version 1)

```json
{
  "version": 1,
  "workspaces": [
    {
      "id": "<GUID>",
      "name": "Production",
      "primaryColor": "#e11d48",
      "connections": [
        {
          "id": "<GUID>",
          "type": "systemAssignedManagedIdentity",
          "name": "My Service Bus",
          "fullyQualifiedNamespace": "<NAMESPACE>",
          "target": "serviceBus"
        }
      ]
    }
  ]
}
```

> [!NOTE]
> All `id` fields must be valid UUIDs, unique across the entire file (workspace IDs must be unique among workspaces; connection IDs must be unique across **all** workspaces).

> [!NOTE]
> `primaryColor` (optional, hex color) sets the workspace's accent color and avatar badge color in the UI. If omitted, one is auto-generated from the workspace's `id`.

> [!NOTE]
> **Legacy format**: if your `sbb-connections.json` is still a flat array (the old format), the backend will automatically wrap it in a single "Default" workspace and log a deprecation warning. Migrate by wrapping your connections in the versioned format above.

#### Connection types

**Service Bus — system-assigned managed identity** *(recommended)*
```json
{
  "id": "<GUID>",
  "type": "systemAssignedManagedIdentity",
  "name": "<NAME>",
  "fullyQualifiedNamespace": "<NAMESPACE>",
  "target": "serviceBus"
}
```

**Service Bus — user-assigned managed identity** *(recommended)*
```json
{
  "id": "<GUID>",
  "type": "userAssignedManagedIdentity",
  "name": "<NAME>",
  "fullyQualifiedNamespace": "<NAMESPACE>",
  "clientId": "<CLIENT_ID>",
  "target": "serviceBus"
}
```

**Service Bus — connection string**
```json
{
  "id": "<GUID>",
  "type": "connectionString",
  "name": "<NAME>",
  "connectionString": "<CONNECTION_STRING>",
  "target": "serviceBus"
}
```
> [!IMPORTANT]
> Using connection strings in the web version is strongly discouraged for deployments beyond your local machine. Prefer a secretless option such as managed identities.

**Service Bus — service principal client secret**
```json
{
  "id": "<GUID>",
  "type": "ServicePrincipalClientSecret",
  "name": "<NAME>",
  "fullyQualifiedNamespace": "<NAMESPACE>",
  "clientId": "<CLIENT_ID>",
  "clientSecret": "<CLIENT_SECRET>",
  "tenantId": "<TENANT_ID>",
  "authority": "<AUTHORITY>",
  "target": "serviceBus"
}
```
> [!IMPORTANT]
> Using service principal secrets in the web version is strongly discouraged for deployments beyond your local machine. Prefer a secretless option such as managed identities.

**RabbitMQ**
```json
{
  "id": "<GUID>",
  "type": "connectionString",
  "name": "<NAME>",
  "host": "<HOST>",
  "managementPort": 15672,
  "amqpPort": 5672,
  "vhost": "/",
  "userName": "<USERNAME>",
  "password": "<PASSWORD>",
  "target": "rabbitmq"
}
```

## Run the application

Mount both configuration files into the container:
```bash
docker run -p 8080:80 \
  --mount type=bind,src=./openid-config.json,dst=/app/openid-config.json \
  --mount type=bind,src=./sbb-connections.json,dst=/app/sbb-connections.json \
  ghcr.io/mligtenberg/servicebusbrowser:main
```

The active workspace the user last selected is stored in browser `localStorage` and restored on the next visit. If the stored workspace no longer exists in the config (e.g. it was removed by the operator), the first workspace in the array becomes active automatically.
