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

## XML response parsing

- Event Hub namespace management responses are Atom XML and are parsed with `fast-xml-parser` (not regex extraction).
- Parser configuration removes namespace prefixes (`removeNSPrefix: true`) so fields can be read as plain keys like `feed.entry`, `content.properties.PartitionIds`, and `PartitionCount`.
- Event hub and consumer group names are resolved from entry `title`; partition IDs are read from `PartitionIds.string`.
