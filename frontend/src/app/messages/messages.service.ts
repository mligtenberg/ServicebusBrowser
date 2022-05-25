import { Injectable } from '@angular/core';
import { ServiceBusMessage, ServiceBusReceivedMessage, ServiceBusReceiver } from '@azure/service-bus';
import { ConnectionService } from '../connections/connection.service';
import { IConnection } from '../connections/ngrx/connections.models';
import { LogService } from '../logging/log.service';
import { IMessage, MessagesChannel } from './ngrx/messages.models';
import * as Long from 'long';
import { Store } from '@ngrx/store';
import { State } from '../ngrx.module';
import { v4 } from 'uuid';
import { createTask, finishTask, updateTaskDonePercentage } from '../ngrx/actions';

@Injectable({
    providedIn: 'root',
})
export class MessagesService {
    constructor(private connectionService: ConnectionService, private log: LogService, private store: Store<State>) {}

    async getQueueMessages(
        connection: IConnection,
        queueName: string,
        numberOfMessages: number,
        channel: MessagesChannel
    ): Promise<IMessage[]> {
        try {
            const messages = await this.getQueuesMessagesInternal(connection, queueName, numberOfMessages, channel);
            this.log.logInfo(`Retrieved ${messages.length} messages for '${connection.name}/${queueName}'`);
            return messages;
        } catch (reason) {
            this.log.logWarning(`Retrieving messages for queue '${queueName}' failed: ${reason}`);
            throw reason;
        }
    }

    async getSubscriptionMessages(
        connection: IConnection,
        topicName: string,
        subscriptionName: string,
        numberOfMessages: number,
        channel: MessagesChannel
    ): Promise<IMessage[]> {
        try {
            const messages = await this.getSubscriptionMessagesInternal(connection, topicName, subscriptionName, numberOfMessages, channel);
            this.log.logInfo(`Retrieved ${messages.length} messages for '${connection.name}/${topicName}/${subscriptionName}'`);
            return messages;
        } catch (reason) {
            this.log.logWarning(`Retrieving messages for subscription '${topicName}/${subscriptionName}' failed: ${reason}`);
            throw reason;
        }
    }

    async clearQueueMessages(connection: IConnection, queueName: string, channel: MessagesChannel): Promise<void> {
        const adminClient = this.connectionService.getAdminClient(connection);
        const runtimeProperties = await adminClient.getQueueRuntimeProperties(queueName);

        let messageCount = 0;
        switch (channel) {
            case MessagesChannel.regular:
                messageCount = runtimeProperties.activeMessageCount;
                break;
            case MessagesChannel.deadletter:
                messageCount = runtimeProperties.deadLetterMessageCount;
                break;
            case MessagesChannel.transferedDeadletters:
                messageCount = runtimeProperties.transferDeadLetterMessageCount;
                break;
        }

        const client = this.connectionService.getClient(connection);
        const receiver = client.createReceiver(queueName, {
            receiveMode: 'receiveAndDelete',
            subQueueType: this.getSubQueueType(channel),
            skipParsingBodyAsJson: true,
        });

        await this.getMessagesInternal(receiver, messageCount, false, {
            pastPerfect: 'Cleared',
            presentContinues: 'Clearing',
        });

        await receiver.close();
        await client.close();
    }

    async clearSubscriptionMessages(
        connection: IConnection,
        topicName: string,
        subscriptionName: string,
        channel: MessagesChannel
    ): Promise<void> {
        const client = this.connectionService.getClient(connection);
        const receiver = client.createReceiver(topicName, subscriptionName, {
            receiveMode: 'receiveAndDelete',
            subQueueType: this.getSubQueueType(channel),
            skipParsingBodyAsJson: true,
        });

        const adminClient = this.connectionService.getAdminClient(connection);
        const runtimeProperties = await adminClient.getSubscriptionRuntimeProperties(topicName, subscriptionName);

        let messageCount = 0;
        switch (channel) {
            case MessagesChannel.regular:
                messageCount = runtimeProperties.activeMessageCount;
                break;
            case MessagesChannel.deadletter:
                messageCount = runtimeProperties.deadLetterMessageCount;
                break;
            case MessagesChannel.transferedDeadletters:
                messageCount = runtimeProperties.transferDeadLetterMessageCount;
                break;
        }

        await this.getMessagesInternal(receiver, messageCount, false, {
            pastPerfect: 'Cleared',
            presentContinues: 'Clearing',
        });

        await receiver.close();
        await client.close();
    }

    async sendMessages(messages: IMessage[], connection: IConnection, queueOrTopicName: string): Promise<void> {
        const client = this.connectionService.getClient(connection);
        const sender = client.createSender(queueOrTopicName);

        const serviceBusMessages = messages.map((m) => {
            const applicationProperties = {};
            for (const [key, value] of m.customProperties) {
                applicationProperties[key] = value;
            }

            return {
                subject: m.properties.subject,
                body: m.body,
                contentType: m.properties.contentType,
                applicationProperties: (Object as any).fromEntries(m.customProperties),
            } as ServiceBusMessage;
        });

        await sender.sendMessages(serviceBusMessages);

        await sender.close();
        await client.close();
    }

    private async getQueuesMessagesInternal(
        connection: IConnection,
        queueName: string,
        numberOfMessages: number,
        channel: MessagesChannel
    ): Promise<IMessage[]> {
        const client = this.connectionService.getClient(connection);
        const receiver = client.createReceiver(queueName, {
            subQueueType: this.getSubQueueType(channel),
            skipParsingBodyAsJson: true,
        });

        const messages = await this.getMessagesInternal(receiver, numberOfMessages, true, {
            pastPerfect: 'Retrieved',
            presentContinues: 'Retrieving',
        });

        await receiver.close();
        await client.close();

        return messages;
    }

    private async getSubscriptionMessagesInternal(
        connection: IConnection,
        topicName: string,
        subscriptionName: string,
        numberOfMessages: number,
        channel: MessagesChannel
    ): Promise<IMessage[]> {
        const client = this.connectionService.getClient(connection);
        const receiver = client.createReceiver(topicName, subscriptionName, {
            subQueueType: this.getSubQueueType(channel),
            skipParsingBodyAsJson: true,
        });

        const messages = await this.getMessagesInternal(receiver, numberOfMessages, true, {
            pastPerfect: 'Retrieved',
            presentContinues: 'Retrieving',
        });

        await receiver.close();
        await client.close();

        return messages;
    }

    private async getMessagesInternal(
        receiver: ServiceBusReceiver,
        numberOfMessages: number,
        peek: boolean,
        messageWord: {
            presentContinues: string;
            pastPerfect: string;
        }
    ): Promise<IMessage[]> {
        const taskId = v4();
        const message = `${messageWord.pastPerfect} 0 of ${numberOfMessages} messages, 0%`;
        this.store.dispatch(
            createTask({
                id: taskId,
                title: `${messageWord.presentContinues} messages`,
                subtitle: receiver.entityPath,
                donePercentage: 0,
                progressBarMessage: message,
            })
        );

        const messages: ServiceBusReceivedMessage[] = [];
        let lastLength = -1;

        while (messages.length < numberOfMessages && messages.length !== lastLength) {
            lastLength = messages.length;

            const messagesLeft = numberOfMessages - messages.length;
            const maxMessageCount = messagesLeft > 1000 ? 1000 : messagesLeft;

            const lastSequenceNumber: Long.Long | undefined = messages.length ? messages[messages.length - 1].sequenceNumber : undefined;

            const messagesPart = peek
                ? await receiver.peekMessages(maxMessageCount, {
                      fromSequenceNumber: lastSequenceNumber?.add(1),
                  })
                : await receiver.receiveMessages(maxMessageCount);

            messages.push(...messagesPart);

            const percentage = Math.round((messages.length / numberOfMessages) * 10000) / 100;
            const progressBarMessage = `${messageWord.pastPerfect} ${messages.length} of ${numberOfMessages} messages, ${percentage}%`;
            this.store.dispatch(
                updateTaskDonePercentage({
                    id: taskId,
                    donePercentage: percentage,
                    progressBarMessage,
                })
            );
            this.log.logVerbose(progressBarMessage);
        }

        this.store.dispatch(
            finishTask({
                id: taskId,
            })
        );

        return messages.map((m) => this.mapMessage(m));
    }

    private mapMessage(m: ServiceBusReceivedMessage): IMessage {
        const message = {
            id: m.messageId?.toString(),
            body: this.readBody(m.body),
            properties: {
                contentType: m.contentType ?? '',
                correlationId: m.correlationId?.toString(),
                enqueueSequenceNumber: m.enqueuedSequenceNumber as number,
                enqueueTime: m.enqueuedTimeUtc,
                messageId: m.messageId?.toString(),
                sequenceNumber: m.sequenceNumber,
                subject: m.subject,
            },
            customProperties: new Map<string, string | number | boolean | Date>(),
        };

        if (m.applicationProperties) {
            // tslint:disable-next-line:forin
            for (const key in m.applicationProperties) {
                const value = m.applicationProperties[key];
                message.customProperties.set(key, value);
            }
        }

        return message;
    }

    private readBody(body: any): string {
        if (typeof body === 'string') {
            return body;
        }

        if (typeof body === 'object') {
            return JSON.stringify(body, null, 2);
        }

        return `${body}`;
    }

    private getSubQueueType(channel: MessagesChannel): 'deadLetter' | 'transferDeadLetter' | undefined {
        switch (channel) {
            case MessagesChannel.deadletter:
                return 'deadLetter';
            case MessagesChannel.transferedDeadletters:
                return 'transferDeadLetter';
            default:
                return undefined;
        }
    }
}
