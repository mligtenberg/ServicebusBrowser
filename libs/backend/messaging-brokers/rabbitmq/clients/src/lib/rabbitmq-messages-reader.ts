import {
  MessagesReader,
  PropertyValue,
  RabbitMqConnection,
  RabbitMqQueueReceiveEndpoint,
  ReceiveEndpoint,
  ReceivedMessage,
} from '@service-bus-browser/api-contracts';
import {
  Connection,
  EventContext,
  Receiver,
  ReceiverEvents,
  ReceiverOptions,
} from 'rhea-promise';
import { getConnectionOptions } from './internal/rabbitmq-connection-options';
import { sequenceNumberToKey } from './internal/sequence-number-to-key';
import { RabbitMqManagementClient } from './rabbitmq-management-client';

type ContinuationTokenBody = {
  alreadyLoadedAmountOfMessages: number;
  streamOffset?: number;
  peekTempQueueName?: string;
  peekTempExchangeName?: string;
};

export class RabbitMqMessagesReader implements MessagesReader {
  constructor(private readonly connection: RabbitMqConnection) {}

  async receiveMessages(
    receiveEndpoint: ReceiveEndpoint,
    options: {
      receiveMode: 'peek' | 'receive';
      maxAmountOfMessagesToReceive?: number;
      streamOffset?: number;
    } = { receiveMode: 'receive' },
    continuationToken?: string,
  ): Promise<{ messages: ReceivedMessage[]; continuationToken?: string }> {
    if (
      !this.isStreamEndpoint(receiveEndpoint) &&
      options.receiveMode === 'peek'
    ) {
      return this.peekQueueMessages(
        receiveEndpoint as RabbitMqQueueReceiveEndpoint,
        options,
        continuationToken,
      );
    }

    return this.receiveMessagesInternal(
      receiveEndpoint,
      options,
      continuationToken,
    );
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

  private async peekQueueMessages(
    receiveEndpoint: RabbitMqQueueReceiveEndpoint,
    options: {
      receiveMode: 'peek' | 'receive';
      maxAmountOfMessagesToReceive?: number;
    },
    continuationToken?: string,
  ): Promise<{ messages: ReceivedMessage[]; continuationToken?: string }> {
    const maxAmount = options.maxAmountOfMessagesToReceive ?? 1;
    const tokenBody = continuationToken
      ? this.decodeContinuationToken<ContinuationTokenBody>(continuationToken)
      : ({ alreadyLoadedAmountOfMessages: 0 } as ContinuationTokenBody);

    const managementClient = new RabbitMqManagementClient(this.connection);

    let tempQueueName = tokenBody.peekTempQueueName;
    let tempExchangeName = tokenBody.peekTempExchangeName;

    try {
      if (!tempQueueName || !tempExchangeName) {
        const id = crypto.randomUUID();
        tempQueueName = `sbb-peek-${id}-q`;
        tempExchangeName = `sbb-peek-${id}-ex`;
        const shovelName = `sbb-peek-${id}-shovel`;

        await managementClient.createExchange(
          receiveEndpoint.vhostName,
          tempExchangeName,
        );
        await managementClient.createQueue(
          receiveEndpoint.vhostName,
          tempQueueName,
        );
        await managementClient.bindQueueToExchange(
          receiveEndpoint.vhostName,
          tempExchangeName,
          tempQueueName,
        );
        await managementClient.bindQueueToExchange(
          receiveEndpoint.vhostName,
          tempExchangeName,
          receiveEndpoint.queueName,
        );

        await managementClient.createShovel(
          receiveEndpoint.vhostName,
          shovelName,
          receiveEndpoint.queueName,
          tempExchangeName,
        );
        await managementClient.waitForShovelCompletion(
          receiveEndpoint.vhostName,
          shovelName,
        );
        await managementClient
          .deleteShovel(receiveEndpoint.vhostName, shovelName)
          .catch(() => undefined);
      }

      const tempEndpoint: RabbitMqQueueReceiveEndpoint = {
        ...receiveEndpoint,
        queueName: tempQueueName,
        queueType: 'classic',
      };

      let currentMaxAmountOfMessagesToReceive =
        maxAmount - tokenBody.alreadyLoadedAmountOfMessages;
      if (currentMaxAmountOfMessagesToReceive > 250) {
        currentMaxAmountOfMessagesToReceive = 250;
      }

      if (currentMaxAmountOfMessagesToReceive <= 0) {
        await this.cleanupTempResources(
          managementClient,
          receiveEndpoint.vhostName,
          tempQueueName,
          tempExchangeName,
        );
        return { messages: [] };
      }

      const messages = await this.readFromEndpoint(
        tempEndpoint,
        currentMaxAmountOfMessagesToReceive,
      );

      const mappedMessages = messages.map((message) =>
        this.mapReceivedMessage(
          message,
          tokenBody.alreadyLoadedAmountOfMessages,
        ),
      );

      const alreadyLoadedAmountOfMessages =
        tokenBody.alreadyLoadedAmountOfMessages + mappedMessages.length;

      const reachedBatchLimit =
        mappedMessages.length === currentMaxAmountOfMessagesToReceive;
      const hasMoreToLoad = reachedBatchLimit && maxAmount > alreadyLoadedAmountOfMessages;

      if (!hasMoreToLoad) {
        await this.cleanupTempResources(
          managementClient,
          receiveEndpoint.vhostName,
          tempQueueName,
          tempExchangeName,
        );
        return { messages: mappedMessages };
      }

      return {
        messages: mappedMessages,
        continuationToken: this.makeContinuationToken<ContinuationTokenBody>({
          alreadyLoadedAmountOfMessages,
          peekTempQueueName: tempQueueName,
          peekTempExchangeName: tempExchangeName,
        }),
      };
    } catch (err) {
      if (tempQueueName) {
        await managementClient
          .deleteQueue(receiveEndpoint.vhostName, tempQueueName)
          .catch(() => undefined);
      }
      if (tempExchangeName) {
        await managementClient
          .deleteExchange(receiveEndpoint.vhostName, tempExchangeName)
          .catch(() => undefined);
      }
      throw err;
    }
  }

  private async cleanupTempResources(
    managementClient: RabbitMqManagementClient,
    vHostName: string,
    tempQueueName: string,
    tempExchangeName: string,
  ): Promise<void> {
    await Promise.allSettled([
      managementClient.deleteQueue(vHostName, tempQueueName),
      managementClient.deleteExchange(vHostName, tempExchangeName),
    ]);
  }

  private async readFromEndpoint(
    endpoint: RabbitMqQueueReceiveEndpoint,
    maxAmount: number,
  ): Promise<EventContext[]> {
    const client = new Connection(
      getConnectionOptions(this.connection, endpoint.vhostName),
    );
    try {
      await client.open();
      const receiver = await client.createReceiver({
        ...this.getReceiverOptions(endpoint, {}),
        autoaccept: false,
        credit_window: 0,
      });

      const messages = await this.collectMessages(receiver, maxAmount, 150);
      await Promise.all(messages.map((m) => m.delivery?.accept()));
      await receiver.close();
      return messages;
    } finally {
      await client.close().catch(() => undefined);
    }
  }

  private async receiveMessagesInternal(
    receiveEndpoint: ReceiveEndpoint,
    options: {
      receiveMode: 'peek' | 'receive';
      maxAmountOfMessagesToReceive?: number;
      streamOffset?: number;
    },
    continuationToken?: string,
  ): Promise<{ messages: ReceivedMessage[]; continuationToken?: string }> {
    const maxAmount = options.maxAmountOfMessagesToReceive ?? 1;
    const tokenBody = continuationToken
      ? this.decodeContinuationToken<ContinuationTokenBody>(continuationToken)
      : ({
          alreadyLoadedAmountOfMessages: 0,
          streamOffset: options.streamOffset,
        } as ContinuationTokenBody);
    let currentMaxAmountOfMessagesToReceive =
      maxAmount - tokenBody.alreadyLoadedAmountOfMessages;
    currentMaxAmountOfMessagesToReceive =
      currentMaxAmountOfMessagesToReceive > 250
        ? 250
        : currentMaxAmountOfMessagesToReceive;

    if (currentMaxAmountOfMessagesToReceive <= 0) {
      return { messages: [] };
    }

    const waitTimeInMs = this.isStreamEndpoint(receiveEndpoint) ? 1000 : 150;
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
        ...this.getReceiverOptions(receiveEndpoint, {
          streamOffset: tokenBody.streamOffset,
        }),
        autoaccept: false,
        credit_window: 0,
      });

      const messages = await this.collectMessages(
        receiver,
        currentMaxAmountOfMessagesToReceive,
        waitTimeInMs,
      );
      if (
        options.receiveMode !== 'peek' &&
        !this.isStreamEndpoint(receiveEndpoint)
      ) {
        await Promise.all(
          messages.map((message) => message.delivery?.accept()),
        );
      } else {
        await Promise.all(
          messages.map((message) => message.delivery?.release()),
        );
      }

      await receiver.close();

      const mappedMessages = messages.map((message) =>
        this.mapReceivedMessage(
          message,
          tokenBody.alreadyLoadedAmountOfMessages,
        ),
      );

      const alreadyLoadedAmountOfMessages =
        tokenBody.alreadyLoadedAmountOfMessages + mappedMessages.length;

      const reachedBatchLimit =
        mappedMessages.length === currentMaxAmountOfMessagesToReceive;
      const shouldReturnContinuationToken =
        reachedBatchLimit && maxAmount > alreadyLoadedAmountOfMessages;
      const newContinuationToken = shouldReturnContinuationToken
        ? this.makeContinuationToken({
            alreadyLoadedAmountOfMessages,
            streamOffset:
              this.getNextStreamOffset(messages) ?? tokenBody.streamOffset,
          })
        : undefined;

      return {
        messages: mappedMessages,
        continuationToken: newContinuationToken,
      };
    } finally {
      await client.close().catch(() => undefined);
    }
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
        if (!context.message) {
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
    alreadyReceivedMessages: number,
  ): ReceivedMessage {
    const message = context.message;
    const body = this.toByteArray(message?.body);
    const id = alreadyReceivedMessages + (context.delivery?.id ?? 0);

    return {
      key: sequenceNumberToKey(id.toString()),
      sequence: id.toString(),
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
    const amqpHeader: Record<string, PropertyValue> = {};
    const setIfDefined = (key: string, value: unknown) => {
      if (value !== undefined) {
        amqpHeader[key] = value as PropertyValue;
      }
    };

    setIfDefined('durable', message?.durable);
    setIfDefined('priority', message?.priority);
    setIfDefined('ttl', message?.ttl);
    setIfDefined('first-acquirer', message?.first_acquirer);
    setIfDefined('delivery-count', message?.delivery_count);

    return Object.keys(amqpHeader).length > 0 ? amqpHeader : undefined;
  }

  private mapAmqpProperties(message: EventContext['message']) {
    const amqpProperties: Record<string, PropertyValue> = {};
    const setIfDefined = (key: string, value: unknown) => {
      if (value !== undefined) {
        amqpProperties[key] = value as PropertyValue;
      }
    };

    setIfDefined('message-id', message?.message_id);
    setIfDefined('user-id', message?.user_id);
    setIfDefined('to', message?.to);
    setIfDefined('subject', message?.subject);
    setIfDefined('reply-to', message?.reply_to);
    setIfDefined('correlation-id', message?.correlation_id);
    setIfDefined('content-type', message?.content_type);
    setIfDefined('content-encoding', message?.content_encoding);
    setIfDefined('absolute-expiry-time', message?.absolute_expiry_time);
    setIfDefined('creation-time', message?.creation_time);
    setIfDefined('group-id', message?.group_id);
    setIfDefined('group-sequence', message?.group_sequence);
    setIfDefined('reply-to-group-id', message?.reply_to_group_id);

    return Object.keys(amqpProperties).length > 0 ? amqpProperties : undefined;
  }

  private getAddress(endpoint: ReceiveEndpoint): string {
    if (endpoint.target === 'rabbitmq' && endpoint.type === 'queue') {
      return `/queues/${encodeURIComponent(endpoint.queueName)}`;
    }

    throw new Error('Invalid RabbitMQ receive endpoint');
  }

  private getReceiverOptions(
    endpoint: ReceiveEndpoint,
    options: { streamOffset?: number },
  ): ReceiverOptions {
    const address = this.getAddress(endpoint);

    if (!this.isStreamEndpoint(endpoint)) {
      return {
        source: { address },
      };
    }

    return {
      source: {
        address,
        filter: {
          'rabbitmq:stream-offset-spec': options.streamOffset ?? 'first',
        },
      },
    };
  }

  private isStreamEndpoint(endpoint: ReceiveEndpoint): boolean {
    return (
      endpoint.target === 'rabbitmq' &&
      endpoint.type === 'queue' &&
      endpoint.queueType === 'stream'
    );
  }

  private getNextStreamOffset(messages: EventContext[]): number | undefined {
    const lastMessage = messages[messages.length - 1]?.message as
      | { message_annotations?: Record<string, unknown> }
      | undefined;

    const messageAnnotations = lastMessage?.message_annotations;
    if (!messageAnnotations) {
      return undefined;
    }

    const offset = messageAnnotations['x-stream-offset'];
    if (typeof offset === 'number' && Number.isFinite(offset)) {
      return offset + 1;
    }

    if (typeof offset === 'string') {
      const parsed = Number.parseInt(offset, 10);
      if (Number.isFinite(parsed)) {
        return parsed + 1;
      }
    }

    return undefined;
  }

  private makeContinuationToken<T>(tokenBody: T): string {
    const buf = Buffer.from(JSON.stringify(tokenBody), 'utf-8');
    return btoa(buf.toString('base64'));
  }

  private decodeContinuationToken<T>(continuationToken: string): T {
    const buf = Buffer.from(atob(continuationToken), 'base64');
    return JSON.parse(buf.toString('utf-8'));
  }
}
