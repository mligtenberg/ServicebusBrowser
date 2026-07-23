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
