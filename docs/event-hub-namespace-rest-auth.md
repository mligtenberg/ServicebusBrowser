# Event Hub Namespace REST Authentication

This document captures how Servicebus Browser authenticates calls to the Event Hub namespace REST management endpoints.

## SAS token construction

- Resource URI must use the namespace host and be lowercased before URL encoding.
- String to sign format is `<url-encoded-resource-uri>\n<unix-expiry-seconds>`.
- HMAC SHA-256 must use `SharedAccessKey` exactly as provided in the connection string.
- Authorization header format is:
  - `SharedAccessSignature sr=...&sig=...&se=...&skn=...`

## REST endpoint versioning

Namespace management calls include `api-version=2017-04` query parameter:

- List event hubs: `/$Resources/EventHubs?api-version=2017-04`
- List consumer groups: `/{eventHubName}/ConsumerGroups?api-version=2017-04`
- Get event hub info: `/{eventHubName}?api-version=2017-04`

## Implementation reference

- `libs/backend/messaging-brokers/event-hub/src/lib/internal/namespace-rest-client.ts`
