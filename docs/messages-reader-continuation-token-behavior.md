# Messages Reader Continuation Token Behavior

This document captures the continuation-token contract used by broker-specific message readers.

## Shared contract

- `maxAmountOfMessagesToReceive` is the total amount for one load operation, not per backend call.
- `alreadyLoadedAmountOfMessages` in continuation tokens tracks progress across calls.
- Readers must stop returning continuation tokens once requested amount is reached.

## Implementation implications

- Each call should compute a remaining budget: `maxAmountOfMessagesToReceive - alreadyLoadedAmountOfMessages`.
- If the remaining budget is `<= 0`, return no continuation token.
- Message readers should cap per-call retrieval by the remaining budget.
- Continuation tokens should only be returned when:
  - at least one new message was loaded, and
  - requested total has not been reached yet.

## Event Hub note

- Event Hub reads across all partitions. The remaining budget must be applied before and during partition iteration so total messages per load operation never exceed the requested amount.
- Event Hub message keys include partition id and a left-padded sequence number (`{partitionId}-{paddedSequence}`) to keep lexical sorting stable like Service Bus sequence-based keys.

## AMQP → WebSocket fallback is sticky across pages

Service Bus and Event Hub readers connect over plain AMQP (port 5671) first and only retry over AMQP-over-WebSockets (port 443) if the connection attempt doesn't settle within a timeout — see `withAmqpWebSocketFallback` in each broker's `internal/websocket-fallback.ts` (`libs/backend/messaging-brokers/service-bus/clients/src/lib/internal/websocket-fallback.ts` and `libs/backend/messaging-brokers/event-hub/src/lib/internal/websocket-fallback.ts`, byte-identical, not deduplicated into a shared lib).

A blocked AMQP port doesn't clear up between paging calls, so once a call falls back to WebSockets, every `ContinuationTokenBody` (`receiveMessages` and, for Service Bus, `clear`'s `DeleteContinuationTokenBody`) records `usedWebSocket: boolean`. The next call decodes the token and passes `{ forceWebSocket: tokenBody.usedWebSocket }` to `withAmqpWebSocketFallback`, skipping the doomed AMQP attempt (and its multi-second timeout) entirely for the rest of that paging session. `withAmqpWebSocketFallback`'s `useClient` callback now also receives the `useWebSocket` flag it was called with, so callers can capture which transport actually served the request and persist it back into the token they build for the next page.

### RabbitMQ's variant: a 3-way transport chain, not a 2-way one

RabbitMQ has no built-in AMQP-over-WebSocket support — that requires the `rabbitmq_web_amqp` plugin, which is not installed by default and (unlike Azure Service Bus/Event Hub) has no fixed relationship to the plain AMQP port. So `libs/backend/messaging-brokers/rabbitmq/clients/src/lib/internal/websocket-fallback.ts` is a RabbitMQ-specific implementation (deliberately not unified with the byte-identical service-bus/event-hub helper, since the fallback chain shape genuinely differs) exporting `withRabbitMqTransportFallback`:

1. Plain AMQP (`connection.amqpPort`) — same timeout-race-then-fallback behavior as the other brokers.
2. `ws://<host>:15678/ws` — the `rabbitmq_web_amqp` plugin's default non-TLS port/path, subprotocol `amqp`.
3. `wss://<host>:15677/ws` — the plugin's default TLS port, tried only if step 2 also fails (any error, not just a timeout, since a missing/disabled plugin usually rejects the WebSocket upgrade immediately rather than hanging).

If all three fail, callers get a `RabbitMqWebSocketUnavailableError` naming the plugin as the likely cause. `getConnectionOptions` in `internal/rabbitmq-connection-options.ts` takes a `transport: 'amqp' | 'ws' | 'wss'` parameter and builds the matching `rhea-promise` `ConnectionOptions` (for `ws`/`wss` it sets `webSocketOptions.url`/`protocol` explicitly, since rhea-promise — unlike the `@azure/service-bus`/`@azure/event-hubs` wrappers — doesn't derive the WebSocket URL from host/port itself). Continuation tokens carry `usedTransport?: 'amqp' | 'ws' | 'wss'` (instead of a boolean) and pass it back in as `forceTransport` on subsequent pages, in both `receiveMessagesInternal` and the peek path's `readFromEndpoint`.
