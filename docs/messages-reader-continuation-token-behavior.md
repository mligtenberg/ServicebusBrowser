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
