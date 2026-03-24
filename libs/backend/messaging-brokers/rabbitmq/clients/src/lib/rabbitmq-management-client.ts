import { RabbitMqConnection } from '@service-bus-browser/api-contracts';
import { getManagementBaseUrl } from './internal/rabbitmq-connection-options';

export interface RabbitMqQueue {
  name: string;
  vhost: string;
  messages: number;
  messages_ready: number;
  messages_unacknowledged: number;
  type: 'classic' | 'quorum' | 'stream';
}

export interface RabbitMqExchange {
  name: string;
  vhost: string;
  type: string;
  durable: boolean;
  auto_delete: boolean;
  internal: boolean;
}

export interface RabbitMqVHost {
  name: string;
}

export interface RabbitMqShovel {
  name: string;
  vhost: string;
  state: string;
}

export class RabbitMqManagementClient {
  constructor(private readonly connection: RabbitMqConnection) {}

  async checkConnection(): Promise<boolean> {
    try {
      await this.getVHosts();
      return true;
    } catch {
      return false;
    }
  }

  async getVHosts(): Promise<RabbitMqVHost[]> {
    return this.request<RabbitMqVHost[]>('/api/vhosts');
  }

  async getQueuesByVHost(vHostName: string): Promise<RabbitMqQueue[]> {
    const vHost = encodeURIComponent(vHostName);
    return this.request<RabbitMqQueue[]>(`/api/queues/${vHost}`);
  }

  async getQueueByVHost(
    vHostName: string,
    queueName: string,
  ): Promise<RabbitMqQueue> {
    const vHost = encodeURIComponent(vHostName);
    const encodedQueueName = encodeURIComponent(queueName);
    return this.request<RabbitMqQueue>(
      `/api/queues/${vHost}/${encodedQueueName}`,
    );
  }

  async getExchangesByVHost(vHostName: string): Promise<RabbitMqExchange[]> {
    const vHost = encodeURIComponent(vHostName);
    return this.request<RabbitMqExchange[]>(`/api/exchanges/${vHost}`);
  }

  async createQueue(vHostName: string, queueName: string): Promise<void> {
    const vHost = encodeURIComponent(vHostName);
    const encodedQueueName = encodeURIComponent(queueName);
    await this.requestWithBody(
      'PUT',
      `/api/queues/${vHost}/${encodedQueueName}`,
      {
        durable: false,
        auto_delete: false,
        arguments: { 'x-expires': 3600000 },
      },
    );
  }

  async deleteQueue(vHostName: string, queueName: string): Promise<void> {
    const vHost = encodeURIComponent(vHostName);
    const encodedQueueName = encodeURIComponent(queueName);
    await this.requestDelete(`/api/queues/${vHost}/${encodedQueueName}`);
  }

  async createExchange(vHostName: string, exchangeName: string): Promise<void> {
    const vHost = encodeURIComponent(vHostName);
    const encodedExchangeName = encodeURIComponent(exchangeName);
    await this.requestWithBody(
      'PUT',
      `/api/exchanges/${vHost}/${encodedExchangeName}`,
      {
        type: 'fanout',
        durable: false,
        auto_delete: false,
        internal: false,
      },
    );
  }

  async deleteExchange(
    vHostName: string,
    exchangeName: string,
  ): Promise<void> {
    const vHost = encodeURIComponent(vHostName);
    const encodedExchangeName = encodeURIComponent(exchangeName);
    await this.requestDelete(
      `/api/exchanges/${vHost}/${encodedExchangeName}`,
    );
  }

  async bindQueueToExchange(
    vHostName: string,
    exchangeName: string,
    queueName: string,
  ): Promise<void> {
    const vHost = encodeURIComponent(vHostName);
    const encodedExchangeName = encodeURIComponent(exchangeName);
    const encodedQueueName = encodeURIComponent(queueName);
    await this.requestWithBody(
      'POST',
      `/api/bindings/${vHost}/e/${encodedExchangeName}/q/${encodedQueueName}`,
      { routing_key: '', arguments: {} },
    );
  }

  async createShovel(
    vHostName: string,
    shovelName: string,
    srcQueue: string,
    destExchange: string,
  ): Promise<void> {
    const vHost = encodeURIComponent(vHostName);
    const encodedShovelName = encodeURIComponent(shovelName);
    const amqpUri = this.getAmqpUri(vHostName);
    await this.requestWithBody(
      'PUT',
      `/api/parameters/shovel/${vHost}/${encodedShovelName}`,
      {
        value: {
          'src-protocol': 'amqp091',
          'src-uri': amqpUri,
          'src-queue': srcQueue,
          'dest-protocol': 'amqp091',
          'dest-uri': amqpUri,
          'dest-exchange': destExchange,
          'src-delete-after': 'queue-length',
        },
      },
    );
  }

  async deleteShovel(vHostName: string, shovelName: string): Promise<void> {
    const vHost = encodeURIComponent(vHostName);
    const encodedShovelName = encodeURIComponent(shovelName);
    await this.requestDelete(
      `/api/parameters/shovel/${vHost}/${encodedShovelName}`,
    );
  }

  async getShovels(): Promise<RabbitMqShovel[]> {
    return this.request<RabbitMqShovel[]>('/api/shovels');
  }

  async waitForShovelCompletion(
    vHostName: string,
    shovelName: string,
    timeoutMs = 60000,
  ): Promise<void> {
    const start = Date.now();
    // Give the shovel a moment to register in the shovels list
    await new Promise((r) => setTimeout(r, 200));

    while (Date.now() - start < timeoutMs) {
      const shovels = await this.getShovels();
      const shovel = shovels.find(
        (s) => s.name === shovelName && s.vhost === vHostName,
      );

      if (
        !shovel ||
        shovel.state === 'stopped' ||
        shovel.state === 'terminated'
      ) {
        return;
      }

      await new Promise((r) => setTimeout(r, 300));
    }

    throw new Error(
      `Shovel ${shovelName} did not complete within ${timeoutMs}ms`,
    );
  }

  private getAmqpUri(vHostName: string): string {
    const encodedUser = encodeURIComponent(this.connection.userName);
    const encodedPassword = encodeURIComponent(this.connection.password);
    const encodedVHost = encodeURIComponent(vHostName);
    return `amqp://${encodedUser}:${encodedPassword}@${this.connection.host}:${this.connection.amqpPort}/${encodedVHost}`;
  }

  private async request<T>(path: string): Promise<T> {
    const baseUrl = getManagementBaseUrl(this.connection);
    const response = await fetch(`${baseUrl}${path}`, {
      headers: {
        Authorization: `Basic ${this.getBasicAuth()}`,
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `RabbitMQ management API request failed (${response.status}): ${body}`,
      );
    }

    return (await response.json()) as T;
  }

  private async requestWithBody(
    method: string,
    path: string,
    body: unknown,
  ): Promise<void> {
    const baseUrl = getManagementBaseUrl(this.connection);
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Basic ${this.getBasicAuth()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const responseBody = await response.text();
      throw new Error(
        `RabbitMQ management API request failed (${response.status}): ${responseBody}`,
      );
    }
  }

  private async requestDelete(path: string): Promise<void> {
    const baseUrl = getManagementBaseUrl(this.connection);
    const response = await fetch(`${baseUrl}${path}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Basic ${this.getBasicAuth()}`,
      },
    });

    if (!response.ok && response.status !== 404) {
      const responseBody = await response.text();
      throw new Error(
        `RabbitMQ management API request failed (${response.status}): ${responseBody}`,
      );
    }
  }

  private getBasicAuth(): string {
    const value = `${this.connection.userName}:${this.connection.password}`;
    return Buffer.from(value, 'utf-8').toString('base64');
  }
}
