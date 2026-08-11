import { IdleTimeoutConnectionCache } from './idle-timeout-connection-cache';

describe('IdleTimeoutConnectionCache', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('creates a connection on first access', async () => {
    const createConnection = jest.fn((key: string) => `connection-${key}`);
    const cache = new IdleTimeoutConnectionCache<string, string>({
      idleTimeoutMs: 1000,
      createConnection,
    });

    const connection = await cache.get('a');

    expect(connection).toBe('connection-a');
    expect(createConnection).toHaveBeenCalledTimes(1);
    expect(cache.has('a')).toBe(true);
    expect(cache.size).toBe(1);
  });

  it('returns the cached connection on subsequent access without recreating it', async () => {
    const createConnection = jest.fn((key: string) => `connection-${key}`);
    const cache = new IdleTimeoutConnectionCache<string, string>({
      idleTimeoutMs: 1000,
      createConnection,
    });

    await cache.get('a');
    await cache.get('a');
    await cache.get('a');

    expect(createConnection).toHaveBeenCalledTimes(1);
  });

  it('shares an in-flight creation across concurrent callers for the same key', async () => {
    let resolveCreate!: (value: string) => void;
    const createConnection = jest.fn(
      () =>
        new Promise<string>((resolve) => {
          resolveCreate = resolve;
        }),
    );
    const cache = new IdleTimeoutConnectionCache<string, string>({
      idleTimeoutMs: 1000,
      createConnection,
    });

    const first = cache.get('a');
    const second = cache.get('a');

    resolveCreate('connection-a');

    const [firstResult, secondResult] = await Promise.all([first, second]);

    expect(firstResult).toBe('connection-a');
    expect(secondResult).toBe('connection-a');
    expect(createConnection).toHaveBeenCalledTimes(1);
  });

  it('evicts and disposes a connection after the idle timeout elapses', async () => {
    const disposeConnection = jest.fn();
    const cache = new IdleTimeoutConnectionCache<string, string>({
      idleTimeoutMs: 1000,
      createConnection: (key) => `connection-${key}`,
      disposeConnection,
    });

    await cache.get('a');
    jest.advanceTimersByTime(999);
    expect(cache.has('a')).toBe(true);
    expect(disposeConnection).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    // Let the fire-and-forget eviction promise settle.
    await Promise.resolve();
    await Promise.resolve();

    expect(cache.has('a')).toBe(false);
    expect(cache.size).toBe(0);
    expect(disposeConnection).toHaveBeenCalledWith('connection-a', 'a');
  });

  it('resets the idle timer on every access', async () => {
    const disposeConnection = jest.fn();
    const cache = new IdleTimeoutConnectionCache<string, string>({
      idleTimeoutMs: 1000,
      createConnection: (key) => `connection-${key}`,
      disposeConnection,
    });

    await cache.get('a');
    jest.advanceTimersByTime(600);
    await cache.get('a'); // resets the timer back to 1000ms remaining
    jest.advanceTimersByTime(600);

    expect(cache.has('a')).toBe(true);
    expect(disposeConnection).not.toHaveBeenCalled();

    jest.advanceTimersByTime(400);
    await Promise.resolve();
    await Promise.resolve();

    expect(cache.has('a')).toBe(false);
    expect(disposeConnection).toHaveBeenCalledTimes(1);
  });

  it('deletes and disposes a connection on demand', async () => {
    const disposeConnection = jest.fn();
    const cache = new IdleTimeoutConnectionCache<string, string>({
      idleTimeoutMs: 1000,
      createConnection: (key) => `connection-${key}`,
      disposeConnection,
    });

    await cache.get('a');
    await cache.delete('a');

    expect(cache.has('a')).toBe(false);
    expect(disposeConnection).toHaveBeenCalledWith('connection-a', 'a');
  });

  it('is a no-op to delete a key that is not cached', async () => {
    const disposeConnection = jest.fn();
    const cache = new IdleTimeoutConnectionCache<string, string>({
      idleTimeoutMs: 1000,
      createConnection: (key) => `connection-${key}`,
      disposeConnection,
    });

    await expect(cache.delete('missing')).resolves.toBeUndefined();
    expect(disposeConnection).not.toHaveBeenCalled();
  });

  it('clears and disposes every cached connection', async () => {
    const disposeConnection = jest.fn();
    const cache = new IdleTimeoutConnectionCache<string, string>({
      idleTimeoutMs: 1000,
      createConnection: (key) => `connection-${key}`,
      disposeConnection,
    });

    await cache.get('a');
    await cache.get('b');
    await cache.clear();

    expect(cache.size).toBe(0);
    expect(disposeConnection).toHaveBeenCalledTimes(2);
  });

  it('forwards a rejecting createConnection to the caller without caching anything', async () => {
    const error = new Error('boom');
    const cache = new IdleTimeoutConnectionCache<string, string>({
      idleTimeoutMs: 1000,
      createConnection: () => {
        throw error;
      },
    });

    await expect(cache.get('a')).rejects.toThrow('boom');
    expect(cache.has('a')).toBe(false);
  });

  it('routes a disposeConnection failure to onDisposeError instead of throwing', async () => {
    const disposeError = new Error('dispose failed');
    const onDisposeError = jest.fn();
    const cache = new IdleTimeoutConnectionCache<string, string>({
      idleTimeoutMs: 1000,
      createConnection: (key) => `connection-${key}`,
      disposeConnection: () => {
        throw disposeError;
      },
      onDisposeError,
    });

    await cache.get('a');
    await expect(cache.delete('a')).resolves.toBeUndefined();

    expect(onDisposeError).toHaveBeenCalledWith(disposeError, 'a');
  });
});
