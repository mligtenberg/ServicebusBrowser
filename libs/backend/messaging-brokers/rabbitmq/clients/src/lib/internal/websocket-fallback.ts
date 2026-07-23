import { RabbitMqTransport } from './rabbitmq-connection-options';

const DEFAULT_CONNECT_TIMEOUT_MS = 10_000;

export class RabbitMqConnectionTimeoutError extends Error {
  constructor(transport: RabbitMqTransport, timeoutMs: number) {
    super(`RabbitMQ ${transport} connection did not complete within ${timeoutMs}ms`);
    this.name = 'RabbitMqConnectionTimeoutError';
  }
}

export class RabbitMqWebSocketUnavailableError extends Error {
  constructor(cause: unknown) {
    super(
      'Could not connect to RabbitMQ over AMQP-over-WebSocket (ws/wss) either. ' +
        'The plain AMQP port appears blocked and the `rabbitmq_web_amqp` plugin ' +
        'is likely not installed/enabled on this broker.',
      { cause },
    );
    this.name = 'RabbitMqWebSocketUnavailableError';
  }
}

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  transport: RabbitMqTransport,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new RabbitMqConnectionTimeoutError(transport, timeoutMs)),
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
 * Plain AMQP is tried first. A blocked/firewalled AMQP port makes rhea hang instead of
 * failing fast, so a stuck attempt is timed out and retried over AMQP-over-WebSocket via the
 * `rabbitmq_web_amqp` plugin - first `ws://`, then `wss://` (its default non-TLS/TLS ports),
 * since that plugin isn't installed by default and we don't know which scheme it's set up for.
 * If neither WebSocket attempt works, a `RabbitMqWebSocketUnavailableError` is thrown.
 *
 * Pass `forceTransport` (e.g. from a continuation token that already found a working transport)
 * to skip straight to it instead of re-running the whole chain.
 */
export async function withRabbitMqTransportFallback<TClient, TResult>(
  createClient: (transport: RabbitMqTransport) => TClient,
  useClient: (client: TClient, transport: RabbitMqTransport) => Promise<TResult>,
  options?: { timeoutMs?: number; forceTransport?: RabbitMqTransport },
): Promise<TResult> {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_CONNECT_TIMEOUT_MS;

  if (options?.forceTransport) {
    return useClient(createClient(options.forceTransport), options.forceTransport);
  }

  try {
    return await withTimeout(useClient(createClient('amqp'), 'amqp'), timeoutMs, 'amqp');
  } catch (error) {
    if (!(error instanceof RabbitMqConnectionTimeoutError)) {
      throw error;
    }
  }

  try {
    return await withTimeout(useClient(createClient('ws'), 'ws'), timeoutMs, 'ws');
  } catch {
    // ws failed or isn't available - fall through and try the TLS variant before giving up.
  }

  try {
    return await withTimeout(useClient(createClient('wss'), 'wss'), timeoutMs, 'wss');
  } catch (error) {
    throw new RabbitMqWebSocketUnavailableError(error);
  }
}
