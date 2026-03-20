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

  private getBasicAuth(): string {
    const value = `${this.connection.userName}:${this.connection.password}`;
    return Buffer.from(value, 'utf-8').toString('base64');
  }
}
