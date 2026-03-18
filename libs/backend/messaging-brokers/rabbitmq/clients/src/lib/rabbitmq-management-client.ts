import { RabbitMqConnection } from '@service-bus-browser/api-contracts';
import {
  getManagementBaseUrl,
  getVHost,
} from './internal/rabbitmq-connection-options';

export interface RabbitMqQueue {
  name: string;
  messages: number;
  messages_ready: number;
  messages_unacknowledged: number;
}

export class RabbitMqManagementClient {
  constructor(private readonly connection: RabbitMqConnection) {}

  async checkConnection(): Promise<boolean> {
    try {
      await this.getQueues();
      return true;
    } catch {
      return false;
    }
  }

  async getQueues(): Promise<RabbitMqQueue[]> {
    const vHost = encodeURIComponent(getVHost(this.connection));
    return this.request<RabbitMqQueue[]>(`/api/queues/${vHost}`);
  }

  async getQueue(queueName: string): Promise<RabbitMqQueue> {
    const vHost = encodeURIComponent(getVHost(this.connection));
    const encodedQueueName = encodeURIComponent(queueName);
    return this.request<RabbitMqQueue>(
      `/api/queues/${vHost}/${encodedQueueName}`,
    );
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
