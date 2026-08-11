/**
 * Options for constructing an {@link IdleTimeoutConnectionCache}.
 */
export interface IdleTimeoutConnectionCacheOptions<TKey, TConnection> {
  /**
   * How long an entry may sit unused before it is evicted and disposed, in
   * milliseconds. Every successful {@link IdleTimeoutConnectionCache.get}
   * call resets this timer for that key.
   */
  idleTimeoutMs: number;

  /**
   * Creates a new connection for a cache miss. May be async. If the factory
   * throws/rejects, nothing is cached and the error propagates to the
   * caller of `get`.
   */
  createConnection: (key: TKey) => TConnection | Promise<TConnection>;

  /**
   * Called when a connection is evicted, either because it went idle or
   * because it was explicitly removed/disposed. Errors thrown here are
   * caught and forwarded to `onDisposeError` (if provided) instead of
   * propagating, so a misbehaving connection can't break cache bookkeeping.
   */
  disposeConnection?: (
    connection: TConnection,
    key: TKey,
  ) => void | Promise<void>;

  /** Invoked when `disposeConnection` throws or rejects. */
  onDisposeError?: (error: unknown, key: TKey) => void;
}

interface CacheEntry<TConnection> {
  connection: TConnection;
  timer: ReturnType<typeof setTimeout>;
}

/**
 * A generic keyed cache of long-lived connections (or any other expensive,
 * reusable resource) that evicts and disposes entries after they have not
 * been accessed for a configurable idle timeout.
 *
 * Intended to be shared by the messaging-broker backend client libraries
 * (Service Bus, RabbitMQ, Event Hub) so they don't each reimplement their
 * own connection-caching/eviction logic.
 *
 * Not safe to share across unrelated key spaces with colliding key values;
 * use one instance per connection "kind" and a key that uniquely identifies
 * the underlying resource (e.g. a connection id).
 */
export class IdleTimeoutConnectionCache<TKey, TConnection> {
  private readonly entries = new Map<TKey, CacheEntry<TConnection>>();
  private readonly pending = new Map<TKey, Promise<TConnection>>();

  constructor(
    private readonly options: IdleTimeoutConnectionCacheOptions<
      TKey,
      TConnection
    >,
  ) {}

  /** Number of connections currently cached (idle timer running). */
  get size(): number {
    return this.entries.size;
  }

  /** Whether a connection for `key` is currently cached. */
  has(key: TKey): boolean {
    return this.entries.has(key);
  }

  /**
   * Returns the cached connection for `key`, refreshing its idle timer.
   * If none is cached, creates one via `createConnection`, caches it, and
   * returns it. Concurrent calls for the same key while creation is in
   * flight share the same in-flight promise instead of creating duplicate
   * connections.
   */
  async get(key: TKey): Promise<TConnection> {
    const existing = this.entries.get(key);
    if (existing) {
      this.resetTimer(key, existing);
      return existing.connection;
    }

    const inFlight = this.pending.get(key);
    if (inFlight) {
      return inFlight;
    }

    const creation = (async () => {
      try {
        const connection = await this.options.createConnection(key);
        // Another call may have raced us while awaiting; last one wins the
        // cache slot, but we must not leak the connection we just made.
        this.store(key, connection);
        return connection;
      } finally {
        this.pending.delete(key);
      }
    })();

    this.pending.set(key, creation);
    return creation;
  }

  /**
   * Removes and disposes the cached connection for `key`, if any. Safe to
   * call for a key that isn't cached (no-op).
   */
  async delete(key: TKey): Promise<void> {
    const entry = this.entries.get(key);
    if (!entry) {
      return;
    }
    this.entries.delete(key);
    clearTimeout(entry.timer);
    await this.dispose(entry.connection, key);
  }

  /** Removes and disposes every cached connection. */
  async clear(): Promise<void> {
    const keys = [...this.entries.keys()];
    await Promise.all(keys.map((key) => this.delete(key)));
  }

  private store(key: TKey, connection: TConnection): void {
    const existing = this.entries.get(key);
    if (existing) {
      clearTimeout(existing.timer);
    }
    const timer = this.scheduleEviction(key);
    this.entries.set(key, { connection, timer });
  }

  private resetTimer(key: TKey, entry: CacheEntry<TConnection>): void {
    clearTimeout(entry.timer);
    entry.timer = this.scheduleEviction(key);
  }

  private scheduleEviction(key: TKey): ReturnType<typeof setTimeout> {
    const timer = setTimeout(() => {
      void this.delete(key);
    }, this.options.idleTimeoutMs);
    // Don't let a cached connection keep the Node process alive.
    timer.unref?.();
    return timer;
  }

  private async dispose(connection: TConnection, key: TKey): Promise<void> {
    if (!this.options.disposeConnection) {
      return;
    }
    try {
      await this.options.disposeConnection(connection, key);
    } catch (error) {
      this.options.onDisposeError?.(error, key);
    }
  }
}
