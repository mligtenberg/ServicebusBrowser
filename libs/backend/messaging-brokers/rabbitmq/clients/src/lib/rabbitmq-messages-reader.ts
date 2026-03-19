import {
  MessagesReader,
  PropertyValue,
  RabbitMqConnection,
  ReceiveEndpoint,
  ReceivedMessage,
} from '@service-bus-browser/api-contracts';
import {
  Connection,
  EventContext,
  Receiver,
  ReceiverEvents,
} from 'rhea-promise';
import { getConnectionOptions } from './internal/rabbitmq-connection-options';

export class RabbitMqMessagesReader implements MessagesReader {
  constructor(private readonly connection: RabbitMqConnection) {}

  async receiveMessages(
    receiveEndpoint: ReceiveEndpoint,
    options: {
      receiveMode: 'peek' | 'receive';
      maxAmountOfMessagesToReceive?: number;
    } = { receiveMode: 'receive' },
  ): Promise<{ messages: ReceivedMessage[]; continuationToken?: string }> {
    const maxAmount = options.maxAmountOfMessagesToReceive ?? 1;
    const client = new Connection(
      getConnectionOptions(
        this.connection,
        receiveEndpoint.target === 'rabbitmq'
          ? receiveEndpoint.vhostName
          : undefined,
      ),
    );

    try {
      await client.open();
      const receiver = await client.createReceiver({
        source: { address: this.getAddress(receiveEndpoint) },
        autoaccept: false,
        credit_window: 0,
      });

      const messages = await this.collectMessages(receiver, maxAmount, 150);
      if (options.receiveMode !== 'peek') {
        await Promise.all(
          messages.map((message) => message.delivery?.accept()),
        );
      } else {
        await Promise.all(
          messages.map((message) => message.delivery?.release()),
        );
      }

      await receiver.close();

      return {
        messages: messages.map((message, index) =>
          this.mapReceivedMessage(message, index),
        ),
      };
    } finally {
      await client.close().catch(() => undefined);
    }
  }

  async clear(
    receiveEndpoint: ReceiveEndpoint,
  ): Promise<{ continuationToken?: string }> {
    const result = await this.receiveMessages(receiveEndpoint, {
      receiveMode: 'receive',
      maxAmountOfMessagesToReceive: 250,
    });

    return result.messages.length < 250
      ? {}
      : {
          continuationToken: Buffer.from('pending', 'utf-8').toString('base64'),
        };
  }

  private collectMessages(
    receiver: Receiver,
    maxAmount: number,
    waitTimeInMs: number,
  ): Promise<EventContext[]> {
    return new Promise((resolve) => {
      const messages: EventContext[] = [];
      const done = () => {
        receiver.removeListener(ReceiverEvents.message, onMessage);
        resolve(messages);
      };

      const onMessage = (context: EventContext) => {
        if (!context.delivery || !context.message) {
          return;
        }

        messages.push(context);
        if (messages.length >= maxAmount) {
          done();
        }
      };

      receiver.on(ReceiverEvents.message, onMessage);
      receiver.addCredit(maxAmount);

      setTimeout(done, waitTimeInMs);
    });
  }

  private mapReceivedMessage(
    context: EventContext,
    index: number,
  ): ReceivedMessage {
    const message = context.message;
    const body = this.toByteArray(message?.body);

    return {
      key: context.delivery?.id?.toString() ?? `${Date.now()}-${index}`,
      sequence: context.delivery?.id?.toString() ?? `${index}`,
      messageId: message?.message_id?.toString(),
      body,
      contentType: message?.content_type,
      headers: this.mapAmqpHeader(message),
      deliveryAnnotations:
        (message?.delivery_annotations as Record<string, PropertyValue>) ??
        undefined,
      messageAnnotations:
        (message?.message_annotations as Record<string, PropertyValue>) ??
        undefined,
      properties: this.mapAmqpProperties(message),
      applicationProperties:
        (message?.application_properties as Record<string, PropertyValue>) ??
        {},
    };
  }

  private toByteArray(body: unknown): Uint8Array {
    if (body === null || body === undefined) {
      return new Uint8Array();
    }

    if (typeof body === 'string') {
      return Buffer.from(body, 'utf-8');
    }

    if (typeof body !== 'object') {
      return Buffer.from(body.toString(), 'utf-8');
    }

    if (body instanceof Uint8Array) {
      return body;
    }

    if ('content' in body && Buffer.isBuffer(body.content)) {
      body = body.content;
    }

    if (Buffer.isBuffer(body)) {
      return new Uint8Array(body);
    }

    return Buffer.from(JSON.stringify(body), 'utf-8');
  }

  private mapAmqpHeader(message: EventContext['message']) {
    const header = (message as { header?: Record<string, unknown> } | undefined)
      ?.header;
    if (!header) {
      return undefined;
    }

    const amqpHeader: Record<string, PropertyValue> = {};
    const setIfDefined = (key: string, value: unknown) => {
      if (value !== undefined) {
        amqpHeader[key] = value as PropertyValue;
      }
    };

    setIfDefined('durable', header['durable']);
    setIfDefined('priority', header['priority']);
    setIfDefined('ttl', header['ttl']);
    setIfDefined('first-acquirer', header['first_acquirer']);
    setIfDefined('delivery-count', header['delivery_count']);

    return Object.keys(amqpHeader).length > 0 ? amqpHeader : undefined;
  }

  private mapAmqpProperties(message: EventContext['message']) {
    const properties = (
      message as { properties?: Record<string, unknown> } | undefined
    )?.properties;
    if (!properties) {
      return undefined;
    }

    const amqpProperties: Record<string, PropertyValue> = {};
    const setIfDefined = (key: string, value: unknown) => {
      if (value !== undefined) {
        amqpProperties[key] = value as PropertyValue;
      }
    };

    setIfDefined('message-id', properties['message_id']);
    setIfDefined('user-id', properties['user_id']);
    setIfDefined('to', properties['to']);
    setIfDefined('subject', properties['subject']);
    setIfDefined('reply-to', properties['reply_to']);
    setIfDefined('correlation-id', properties['correlation_id']);
    setIfDefined('content-type', properties['content_type']);
    setIfDefined('content-encoding', properties['content_encoding']);
    setIfDefined('absolute-expiry-time', properties['absolute_expiry_time']);
    setIfDefined('creation-time', properties['creation_time']);
    setIfDefined('group-id', properties['group_id']);
    setIfDefined('group-sequence', properties['group_sequence']);
    setIfDefined('reply-to-group-id', properties['reply_to_group_id']);

    return Object.keys(amqpProperties).length > 0 ? amqpProperties : undefined;
  }

  private getAddress(endpoint: ReceiveEndpoint): string {
    if (endpoint.target === 'rabbitmq' && endpoint.type === 'queue') {
      return endpoint.queueName;
    }

    throw new Error('Invalid RabbitMQ receive endpoint');
  }
}
