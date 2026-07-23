const DEFAULT_CONNECT_TIMEOUT_MS = 10_000;

export class AmqpConnectionTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`AMQP connection did not complete within ${timeoutMs}ms`);
    this.name = 'AmqpConnectionTimeoutError';
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new AmqpConnectionTimeoutError(timeoutMs)),
      timeoutMs,
    );

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

/**
 * A blocked AMQP port (5671) makes the SDK hang instead of failing fast. If `useClient`
 * doesn't settle within `timeoutMs`, retry once over AMQP-over-WebSockets (port 443).
 *
 * Pass `forceWebSocket: true` (e.g. because a prior call already fell back, as recorded in a
 * continuation token) to skip the doomed AMQP attempt and connect over WebSockets directly.
 */
export async function withAmqpWebSocketFallback<TClient, TResult>(
  createClient: (useWebSocket: boolean) => TClient,
  useClient: (client: TClient, useWebSocket: boolean) => Promise<TResult>,
  options?: { timeoutMs?: number; forceWebSocket?: boolean },
): Promise<TResult> {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_CONNECT_TIMEOUT_MS;

  if (!options?.forceWebSocket) {
    try {
      return await withTimeout(useClient(createClient(false), false), timeoutMs);
    } catch (error) {
      if (!(error instanceof AmqpConnectionTimeoutError)) {
        throw error;
      }
    }
  }

  return useClient(createClient(true), true);
}
