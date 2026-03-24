import {
  Message,
  MessagesSender,
  RabbitMqConnection,
  SendEndpoint,
} from '@service-bus-browser/api-contracts';
import { Connection, Message as RheaMessage, Sender } from 'rhea-promise';
import { getConnectionOptions } from './internal/rabbitmq-connection-options';

export class RabbitMqMessagesSender implements MessagesSender {
  constructor(private readonly connection: RabbitMqConnection) {}

  async send(endpoint: SendEndpoint, message: Message): Promise<void> {
    const client = new Connection(
      getConnectionOptions(
        this.connection,
        endpoint.target === 'rabbitmq' ? endpoint.vhostName : undefined,
      ),
    );
    try {
      await client.open();
      const sender = await client.createSender({
        target: { address: this.getAddress(endpoint) },
      });
      await this.doSend(message, sender);

      await sender.close();
    } finally {
      await client.close().catch(() => undefined);
    }
  }

  async sendBatch(endpoint: SendEndpoint, messages: Message[]): Promise<void> {
    const client = new Connection(
      getConnectionOptions(
        this.connection,
        endpoint.target === 'rabbitmq' ? endpoint.vhostName : undefined,
      ),
    );
    await client.open();
    const sender = await client.createSender({
      target: { address: this.getAddress(endpoint) },
    });
    for (const message of messages) {
      await this.doSend(message, sender);
    }
    await sender.close();
    await client.close();
  }

  private getAddress(endpoint: SendEndpoint): string {
    if (endpoint.target === 'rabbitmq') {
      if (endpoint.type === 'queue') {
        return endpoint.queueName;
      }

      if (endpoint.type === 'exchange') {
        return endpoint.exchangeName;
      }
    }

    throw new Error('Invalid RabbitMQ send endpoint');
  }

  private doSend(message: Message, sender: Sender): Promise<void> {
    const messageToSend = {
      ...this.mapAmqpProperties(message),
      body: message.body,
      application_properties: message.applicationProperties,
      header: this.mapAmqpHeader(message),
      delivery_annotations: message.deliveryAnnotations,
      message_annotations: message.messageAnnotations,
    } as unknown as RheaMessage;

    const result = new Promise<void>((resolve, reject) => {
      sender.once('accepted', () => {
        resolve();
      })
      sender.once('rejected', (err) => {
        reject(err);
      });
    })

    sender.send(messageToSend);
    return result;
  }

  private mapAmqpHeader(message: Message) {
    const header: Record<string, unknown> = {};
    if (message.headers?.['durable'] !== undefined) {
      header['durable'] = message.headers['durable'];
    }
    if (message.headers?.['priority'] !== undefined) {
      header['priority'] = message.headers['priority'];
    }
    if (message.headers?.['ttl'] !== undefined) {
      header['ttl'] = message.headers['ttl'];
    }
    if (message.headers?.['first-acquirer'] !== undefined) {
      header['first_acquirer'] = message.headers['first-acquirer'];
    }
    if (message.headers?.['delivery-count'] !== undefined) {
      header['delivery_count'] = message.headers['delivery-count'];
    }

    return Object.keys(header).length > 0 ? header : undefined;
  }

  private mapAmqpProperties(message: Message) {
    const properties: Record<string, unknown> = {};
    if (message.properties?.['message-id'] !== undefined) {
      properties['message_id'] = this.toBuffer(
        message.properties['message-id'],
      );
    }
    if (message.properties?.['user-id'] !== undefined) {
      properties['user_id'] = this.toBuffer(message.properties['user-id']);
    }
    if (message.properties?.['to'] !== undefined) {
      properties['to'] = message.properties['to'];
    }
    if (message.properties?.['subject'] !== undefined) {
      properties['subject'] = message.properties['subject'];
    }
    if (message.properties?.['reply-to'] !== undefined) {
      properties['reply_to'] = message.properties['reply-to'];
    }
    if (message.properties?.['correlation-id'] !== undefined) {
      properties['correlation_id'] = this.toBuffer(
        message.properties['correlation-id'],
      );
    }
    if (message.properties?.['content-type'] !== undefined) {
      properties['content_type'] = message.properties['content-type'];
    }
    if (message.properties?.['content-encoding'] !== undefined) {
      properties['content_encoding'] = message.properties['content-encoding'];
    }
    if (message.properties?.['absolute-expiry-time'] !== undefined) {
      properties['absolute_expiry_time'] =
        message.properties['absolute-expiry-time'];
    }
    if (message.properties?.['creation-time'] !== undefined) {
      properties['creation_time'] = message.properties['creation-time'];
    }
    if (message.properties?.['group-id'] !== undefined) {
      properties['group_id'] = message.properties['group-id'];
    }
    if (message.properties?.['group-sequence'] !== undefined) {
      properties['group_sequence'] = message.properties['group-sequence'];
    }
    if (message.properties?.['reply-to-group-id'] !== undefined) {
      properties['reply_to_group_id'] = message.properties['reply-to-group-id'];
    }

    return Object.keys(properties).length > 0 ? properties : undefined;
  }

  private toBuffer(
    value: string | number | Uint8Array | undefined,
  ): string | number | Buffer | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (typeof value === 'string' || typeof value === 'number') {
      return value;
    }

    return Buffer.from(value);
  }
}
