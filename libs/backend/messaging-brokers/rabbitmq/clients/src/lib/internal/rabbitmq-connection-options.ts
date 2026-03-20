import { RabbitMqConnection } from '@service-bus-browser/api-contracts';
import { ConnectionOptions } from 'rhea-promise';

export function getConnectionOptions(
  connection: RabbitMqConnection,
  vhostName?: string,
): ConnectionOptions {
  const vhost = vhostName ?? getVHost(connection);
  const openHostname = vhost === '/' ? undefined : `vhost:${vhost}`;
  const options = {
    host: connection.host,
    hostname: openHostname,
    port: connection.amqpPort,
    username: connection.userName,
    password: connection.password,
    reconnect: false,
  };

  return options as ConnectionOptions;
}

export function getVHost(connection: RabbitMqConnection): string {
  return connection.vhost ?? '/';
}

export function getManagementBaseUrl(connection: RabbitMqConnection): string {
  const protocol = 'http:';
  return `${protocol}//${connection.host}:${connection.managementPort}`;
}
