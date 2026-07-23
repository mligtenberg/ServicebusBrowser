import { RabbitMqConnection } from '@service-bus-browser/api-contracts';
import { ConnectionOptions } from 'rhea-promise';

// rhea-promise defaults this to 60s, which makes a blocked AMQP port
// hang the UI for a full minute instead of failing fast.
const CONNECTION_OPERATION_TIMEOUT_IN_SECONDS = 10;

// Defaults of the `rabbitmq_web_amqp` plugin, which exposes AMQP 1.0 over WebSocket
// for brokers where the plain AMQP port is blocked/firewalled. Not enabled by default.
const WEB_AMQP_PORT = 15678;
const WEB_AMQP_TLS_PORT = 15677;
const WEB_AMQP_PATH = '/ws';
const WEB_AMQP_SUBPROTOCOL = ['amqp'];

export type RabbitMqTransport = 'amqp' | 'ws' | 'wss';

export function getConnectionOptions(
  connection: RabbitMqConnection,
  vhostName?: string,
  transport: RabbitMqTransport = 'amqp',
): ConnectionOptions {
  const vhost = vhostName ?? getVHost(connection);
  const openHostname = vhost === '/' ? undefined : `vhost:${vhost}`;
  const base = {
    hostname: openHostname,
    username: connection.userName,
    password: connection.password,
    reconnect: false,
    operationTimeoutInSeconds: CONNECTION_OPERATION_TIMEOUT_IN_SECONDS,
  };

  if (transport === 'amqp') {
    return {
      ...base,
      host: connection.host,
      port: connection.amqpPort,
    } as ConnectionOptions;
  }

  const port = transport === 'wss' ? WEB_AMQP_TLS_PORT : WEB_AMQP_PORT;

  return {
    ...base,
    webSocketOptions: {
      webSocket: WebSocket,
      url: `${transport}://${connection.host}:${port}${WEB_AMQP_PATH}`,
      protocol: WEB_AMQP_SUBPROTOCOL,
    },
  } as ConnectionOptions;
}

export function getVHost(connection: RabbitMqConnection): string {
  return connection.vhost ?? '/';
}

export function getManagementBaseUrl(connection: RabbitMqConnection): string {
  const protocol = 'http:';
  return `${protocol}//${connection.host}:${connection.managementPort}`;
}
