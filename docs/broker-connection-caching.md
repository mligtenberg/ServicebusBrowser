# Broker Connection Caching (Idle-Timeout Reuse)

Reading a page of messages used to open a brand-new broker connection (TCP/TLS +
AMQP handshake) and close it again immediately after that single page was
fetched. Since paging repeatedly calls `receiveMessages`/`clear` with a
continuation token, this meant paying the full connection-setup cost on every
page — the dominant cost for slow/high-latency brokers.

Each broker's `MessagesReader` now keeps its underlying connection object warm
in an idle-timeout cache instead of closing it after every page. Only the
per-call receiver (or, for Event Hub, the per-call partition subscription) is
still opened/closed per page — the expensive part (the connection itself) is
reused across pages and only torn down after a period of inactivity.

## `IdleTimeoutConnectionCache`

`@service-bus-browser/backend-connection-cache`
(`libs/backend/util/connection-cache`) provides the generic building block:
`IdleTimeoutConnectionCache<TKey, TConnection>`.

- `get(key)` returns the cached connection for `key`, creating it via the
  configured `createConnection` factory on a cache miss. **Every successful
  `get` resets that key's idle timer** — a connection is only closed after it
  has sat unused for the full `idleTimeoutMs` (60 seconds in all three broker
  readers below), not on a fixed schedule.
- Concurrent `get` calls for the same key while creation is in flight share one
  in-flight promise, so two pages requested back-to-back can't create two
  connections for the same key.
- `delete`/`clear` evict and dispose connections on demand (used for
  proactive cleanup, see below). Eviction timers are `unref()`'d so a cached
  connection never keeps the Node process alive.

## Per-broker cache keys

Each `*MessagesReader` instance is itself already cached for the lifetime of a
connection by `ConnectionManager`/`ConnectionClient`
(`libs/backend/server/src/lib/clients/`), so the connection cache lives as an
instance field and only needs to key on what varies *within* a single broker
connection:

| Broker    | File                                                                                          | Cached connection object   | Cache key                                    |
| --------- | ---------------------------------------------------------------------------------------------- | --------------------------- | --------------------------------------------- |
| Service Bus | `libs/backend/messaging-brokers/service-bus/clients/src/lib/service-bus-messages-reader.ts` | `ServiceBusClient`           | `useWebSocket` (AMQP vs. AMQP-over-WebSocket) |
| RabbitMQ    | `libs/backend/messaging-brokers/rabbitmq/clients/src/lib/rabbitmq-messages-reader.ts`        | `Connection` (rhea-promise) | `vhostName` + transport (`amqp`/`ws`/`wss`)   |
| Event Hub   | `libs/backend/messaging-brokers/event-hub/src/lib/event-hub-messages-reader.ts`              | `EventHubConsumerClient`     | `consumerGroup` + `eventHubName` + `useWebSocket` |

A fresh receiver/receiver-options object is still created per page (peekLock
state, credit windows, and stream offsets are inherently per-call), and is
still closed right after that page is read — only the connection itself is
reused.

## Proactive disposal

`MessagesReader` gained an optional `dispose(): Promise<void>` method
(`libs/backend/api-contracts/src/lib/messages/messages-reader.ts`) that clears
a reader's connection cache immediately, bypassing the idle timeout. This is
wired through `ConnectionClient.dispose()`
(`libs/backend/server/src/lib/clients/connection-client.ts`) and called by
`ConnectionManager.renameConnection`/`removeConnection`
(`libs/backend/server/src/lib/clients/connection-manager.ts`) whenever a
cached `ConnectionClient` is evicted, so a renamed/removed connection's broker
connection is closed right away instead of lingering until its idle timer
fires.

## Not covered

`MessagesSender` implementations (`send-messages-actions.ts`) still open and
close a connection per send; this change is scoped to the paged-read path
per [Messages Reader Continuation Token Behavior](./messages-reader-continuation-token-behavior.md),
where the cost of reconnecting on every page is most visible.
