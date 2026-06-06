# Integrated Authentication

Interactive Azure sign-in for Service Bus and Event Hub connections in the
**desktop app**. The user picks "Integrated Authentication" as the auth method,
enters an email, and a popup window handles the Microsoft sign-in. Sessions are
reused per email across restarts.

## Flow

1. **UI** — `service-bus-connection-target` / `event-hub-connection-target`
   components add an `integratedAuth` auth method (radio) plus an `email` input.
   The resolved connection is `{ type: 'azureAD', authMethod: 'integratedAuth',
   fullyQualifiedNamespace, email }`.
2. **Contracts** — `ServiceBusIntegratedAuthConnection` /
   `EventHubIntegratedAuthConnection` in
   `libs/backend/api-contracts/src/lib/connections/`.
3. **Credential** — each broker's `credential-helper.ts` maps `integratedAuth`
   to `new IntegratedAuthCredential(connection.email)` from
   `@service-bus-browser/integrated-auth`.
4. **Token acquisition** — `IntegratedAuthCredential` is a `TokenCredential`
   that delegates `getToken(scopes)` to a registered
   `IntegratedAuthTokenProvider`. This keeps the broker libs free of Electron /
   MSAL coupling.
5. **Provider impl (main process)** —
   `apps/servicebus-browser-app/src/app/events/integrated-auth.ts` registers an
   `ElectronMsalAuthProvider` at bootstrap (from `ServiceBusEvents`). It uses
   `@azure/msal-node` `PublicClientApplication`:
   - tries `acquireTokenSilent` for the cached account matching the email;
   - otherwise runs the authorization-code + PKCE flow, opening an Electron
     `BrowserWindow` popup and intercepting the `http://localhost` redirect to
     read the auth code.

## Key facts

- **Client id**: Azure CLI public client `04b07795-8ddb-461a-bbee-02f9e1bf7b46`
  (`AZURE_CLI_CLIENT_ID`), broadly pre-authorized for Azure resources.
- **Authority**: `https://login.microsoftonline.com/organizations` by default, or
  `…/<tenantId>` when an optional **Tenant ID** is provided on the connection.
  Guest (B2B) accounts **require** the tenant id: with `organizations` the user
  is signed in to their home tenant and the token is not valid for resources in
  the host tenant. The token cache is keyed per `(clientId, tenantId, email)`.
- **Scopes** are passed through from the Azure SDK (e.g.
  `https://servicebus.azure.net/.default`), not hardcoded.
- **Session reuse**: MSAL token cache is serialized per email, encrypted with
  Electron `safeStorage`, to `userData/sbb-auth-<sha256(email)[:32]>.bin`. Same
  email → silent token, even across restarts.
- **Web variant**: not supported — `IntegratedAuthCredential.getToken` throws if
  no provider is registered (provider only exists in the desktop app).
