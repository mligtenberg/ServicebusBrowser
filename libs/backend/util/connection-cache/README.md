# @service-bus-browser/backend-connection-cache

Generic idle-timeout cache for long-lived connections. Shared by the
messaging-broker backend client libraries (Service Bus, RabbitMQ, Event Hub)
so each one doesn't reimplement its own connection caching/eviction.

## Running unit tests

Run `nx test @service-bus-browser/backend-connection-cache` to execute the
unit tests.

## Usage

```ts
import { IdleTimeoutConnectionCache } from '@service-bus-browser/backend-connection-cache';

const cache = new IdleTimeoutConnectionCache<string, MyConnection>({
  idleTimeoutMs: 5 * 60 * 1000,
  createConnection: (connectionId) => new MyConnection(connectionId),
  disposeConnection: (connection) => connection.close(),
  onDisposeError: (error, key) =>
    console.error(`Failed to close connection ${key}`, error),
});

const connection = await cache.get('connection-id');
// ... use connection ...

// Optional: force-evict before the idle timeout fires.
await cache.delete('connection-id');

// Optional: dispose everything, e.g. on process shutdown.
await cache.clear();
```

Every call to `get(key)` for an already-cached key resets that entry's idle
timer. If the connection is not used again within `idleTimeoutMs`, it is
automatically removed from the cache and `disposeConnection` is called.
Concurrent `get` calls for the same key while a connection is being created
share the same in-flight creation instead of creating duplicates.
