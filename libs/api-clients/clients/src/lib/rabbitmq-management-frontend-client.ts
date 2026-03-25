import { ApiHandler } from './api-handler';

export interface RabbitMqQueue {
  name: string;
  vhost: string;
  type: 'classic' | 'quorum' | 'stream';
  durable: boolean;
  auto_delete: boolean;
  messages?: number;
  messages_ready?: number;
  messages_unacknowledged?: number;
}

export interface RabbitMqExchange {
  name: string;
  vhost: string;
  type: string;
  durable: boolean;
  auto_delete: boolean;
  internal: boolean;
}

export class RabbitMqManagementFrontendClient {
  constructor(private rabbitmqApi: ApiHandler) {}

  async getQueue(
    connectionId: string,
    vhostName: string,
    queueName: string,
  ): Promise<RabbitMqQueue> {
    return (await this.rabbitmqApi.rabbitmqManagementDoRequest('getQueue', {
      connectionId,
      vhostName,
      queueName,
    })) as RabbitMqQueue;
  }

  async createQueue(
    connectionId: string,
    vhostName: string,
    queueName: string,
    durable: boolean,
    autoDelete: boolean,
    queueType: 'classic' | 'quorum' | 'stream',
  ): Promise<void> {
    await this.rabbitmqApi.rabbitmqManagementDoRequest('createQueue', {
      connectionId,
      vhostName,
      queueName,
      durable,
      autoDelete,
      queueType,
    });
  }

  async deleteQueue(
    connectionId: string,
    vhostName: string,
    queueName: string,
  ): Promise<void> {
    await this.rabbitmqApi.rabbitmqManagementDoRequest('deleteQueue', {
      connectionId,
      vhostName,
      queueName,
    });
  }

  async getExchange(
    connectionId: string,
    vhostName: string,
    exchangeName: string,
  ): Promise<RabbitMqExchange> {
    return (await this.rabbitmqApi.rabbitmqManagementDoRequest('getExchange', {
      connectionId,
      vhostName,
      exchangeName,
    })) as RabbitMqExchange;
  }

  async createExchange(
    connectionId: string,
    vhostName: string,
    exchangeName: string,
    type: string,
    durable: boolean,
    autoDelete: boolean,
    internal: boolean,
  ): Promise<void> {
    await this.rabbitmqApi.rabbitmqManagementDoRequest('createExchange', {
      connectionId,
      vhostName,
      exchangeName,
      type,
      durable,
      autoDelete,
      internal,
    });
  }

  async deleteExchange(
    connectionId: string,
    vhostName: string,
    exchangeName: string,
  ): Promise<void> {
    await this.rabbitmqApi.rabbitmqManagementDoRequest('deleteExchange', {
      connectionId,
      vhostName,
      exchangeName,
    });
  }
}
