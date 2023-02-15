import { Injectable } from '@angular/core';
import { ServiceBusReceivedMessage, ServiceBusReceiver } from '@azure/service-bus';
import { ConnectionService } from '../connections/connection.service';
import { IConnection } from '../connections/ngrx/connections.models';
import { LogService } from '../logging/log.service';
import { IMessage, MessagesChannel } from './ngrx/messages.models';
import { Store } from '@ngrx/store';
import { State } from '../ngrx.module';
import { Buffer } from 'buffer';
import isBuffer from 'is-buffer';
import { v4 } from 'uuid';
import { createTask, finishTask, updateTaskDonePercentage } from '../ngrx/actions';
import { AmqpAnnotatedMessage } from '@azure/core-amqp';
import Long from 'long';
import { filter, finalize, from, Observable, of, startWith, switchMap, zip } from 'rxjs';
import { LoadStatusUpdate } from './models/load-status-update.model';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class MessagesService {
    constructor(private connectionService: ConnectionService, private log: LogService, private store: Store<State>) {}

    async sendMessages(messages: IMessage[], connection: IConnection, queueOrTopicName: string): Promise<void> {
        const client = this.connectionService.getClient(connection);
        const sender = client.createSender(queueOrTopicName);

        const serviceBusMessages = messages.map((m) => {
            const applicationProperties = {};
            for (const [key, value] of m.customProperties) {
                applicationProperties[key] = value;
            }

            const body = Buffer.from(m.body, 'utf8');

            return {
                subject: m.properties.subject,
                body,
                bodyType: 'data',
                contentType: m.properties.contentType,
                applicationProperties: (Object as any).fromEntries(m.customProperties),
            } as AmqpAnnotatedMessage;
        });

        await sender.sendMessages(serviceBusMessages);

        await sender.close();
        await client.close();
    }

    getQueueMessages(
        connection: IConnection,
        queueName: string,
        channel: MessagesChannel,
        numberOfMessages: number,
        skip?: number,
        fromSequenceNumber?: Long
    ): Observable<IMessage[]> {
        const taskId = v4();
        const targetName = channel === MessagesChannel.regular ? queueName : `${queueName} - ${this.getSubQueueType(channel)}`;

        this.store.dispatch(
            createTask({
                id: taskId,
                title: 'Receiving messages',
                subtitle: targetName,
                donePercentage: 0,
                progressBarMessage: `Loaded 0 of ${numberOfMessages} messages, 0%`,
            })
        );

        return this.getQueuesMessagesInternal(connection, queueName, channel, numberOfMessages, skip, fromSequenceNumber).pipe(
            tap((update) => {
                if (update instanceof LoadStatusUpdate) {
                    switch (update.loadStatus) {
                        case 'loading':
                            const percentage = this.getPercentage(update.totalLoaded, numberOfMessages);
                            const progressBarMessage = `Loaded ${update.totalLoaded} of ${numberOfMessages} messages, ${percentage}%`;
                            this.store.dispatch(
                                updateTaskDonePercentage({
                                    id: taskId,
                                    donePercentage: percentage,
                                    progressBarMessage,
                                })
                            );
                            this.log.logInfo(`Retrieving messages for queue '${connection.name}/${targetName}': ${progressBarMessage}`);
                            break;
                        case 'loaded':
                            this.store.dispatch(finishTask({ id: taskId }));
                            this.log.logInfo(`Retrieved ${update.totalLoaded} messages for '${connection.name}/${targetName}'`);
                            break;
                        case 'error':
                            this.store.dispatch(finishTask({ id: taskId }));
                            this.log.logWarning(
                                `Retrieving messages for subscription '${connection.name}/${targetName}' failed: ${update.error}`
                            );
                            break;
                    }
                }
            }),
            filter((update) => this.isMessageArray(update)),
            map((update) => update as IMessage[])
        );
    }

    getSubscriptionMessages(
        connection: IConnection,
        topicName: string,
        subscriptionName: string,
        channel: MessagesChannel,
        numberOfMessages: number,
        skip?: number,
        fromSequenceNumber?: Long
    ): Observable<IMessage[]> {
        const taskId = v4();
        const targetName = MessagesChannel.regular
            ? `${topicName}/${subscriptionName}`
            : `${topicName}/${subscriptionName} - ${this.getSubQueueType(channel)}`;

        this.store.dispatch(
            createTask({
                id: taskId,
                title: 'Receiving messages',
                subtitle: targetName,
                donePercentage: 0,
                progressBarMessage: `Loaded 0 of ${numberOfMessages} messages, 0%`,
            })
        );

        return this.getSubscriptionMessagesInternal(
            connection,
            topicName,
            subscriptionName,
            channel,
            numberOfMessages,
            skip,
            fromSequenceNumber
        ).pipe(
            tap((update) => {
                if (update instanceof LoadStatusUpdate) {
                    switch (update.loadStatus) {
                        case 'loading':
                            const percentage = this.getPercentage(update.totalLoaded, numberOfMessages);
                            const progressBarMessage = `Loaded ${update.totalLoaded} of ${numberOfMessages} messages, ${percentage}%`;
                            this.store.dispatch(
                                updateTaskDonePercentage({
                                    id: taskId,
                                    donePercentage: percentage,
                                    progressBarMessage: `Loaded 0 of ${numberOfMessages} messages, ${percentage}%`,
                                })
                            );
                            this.log.logInfo(
                                `Retrieving messages for subscription '${connection.name}/${targetName}': ${progressBarMessage}`
                            );
                            break;
                        case 'loaded':
                            this.store.dispatch(finishTask({ id: taskId }));
                            this.log.logInfo(`Retrieved ${update.totalLoaded} messages for '${connection.name}/${targetName}'`);
                            break;
                        case 'error':
                            this.store.dispatch(finishTask({ id: taskId }));
                            this.log.logWarning(
                                `Retrieving messages for subscription '${connection.name}/${targetName}' failed: ${update.error}`
                            );
                            break;
                    }
                }
            }),
            filter((update) => this.isMessageArray(update)),
            map((update) => update as IMessage[])
        );
    }

    clearQueueMessages(connection: IConnection, queueName: string, channel: MessagesChannel): Observable<void> {
        const adminClient = this.connectionService.getAdminClient(connection);
        const client = this.connectionService.getClient(connection);
        const receiver = client.createReceiver(queueName, {
            receiveMode: 'receiveAndDelete',
            subQueueType: this.getSubQueueType(channel),
            skipParsingBodyAsJson: true,
        });

        const taskId = v4();

        this.store.dispatch(
            createTask({
                id: taskId,
                title: 'clearing messages',
                subtitle: channel === MessagesChannel.regular ? queueName : `${queueName} - ${this.getSubQueueType(channel)}`,
                donePercentage: 0,
                progressBarMessage: `No messages cleared, 0%`,
            })
        );

        return zip(from(adminClient.getQueueRuntimeProperties(queueName)), this.readMessages(receiver)).pipe(
            finalize(async () => {
                await receiver.close();
                await client.close();
            }),
            tap(([runtimeProperties, update]) => {
                let messageCount = 0;
                switch (channel) {
                    case MessagesChannel.deadletter:
                        messageCount = runtimeProperties.deadLetterMessageCount;
                        break;
                    case MessagesChannel.transferedDeadletters:
                        messageCount = runtimeProperties.transferDeadLetterMessageCount;
                        break;
                    default:
                        messageCount = runtimeProperties.activeMessageCount;
                        break;
                }

                if (update instanceof LoadStatusUpdate) {
                    const percentage = this.getPercentage(update.totalLoaded, messageCount);
                    const progressBarMessage = `Loaded ${update.totalLoaded} of ${messageCount} messages, ${percentage}%`;

                    const action =
                        update.loadStatus === 'loading'
                            ? updateTaskDonePercentage({
                                  id: taskId,
                                  donePercentage: percentage,
                                  progressBarMessage: `Loaded 0 of ${messageCount} messages, ${percentage}%`,
                              })
                            : finishTask({ id: taskId });

                    this.store.dispatch(action);
                }
            }),
            map(() => void 0)
        );
    }

    clearSubscriptionMessages(
        connection: IConnection,
        topicName: string,
        subscriptionName: string,
        channel: MessagesChannel
    ): Observable<void> {
        const adminClient = this.connectionService.getAdminClient(connection);
        const client = this.connectionService.getClient(connection);
        const receiver = client.createReceiver(topicName, subscriptionName, {
            subQueueType: this.getSubQueueType(channel),
            skipParsingBodyAsJson: true,
        });

        const taskId = v4();

        this.store.dispatch(
            createTask({
                id: taskId,
                title: 'Receiving messages',
                subtitle:
                    channel === MessagesChannel.regular
                        ? `${topicName}/${subscriptionName}`
                        : `${topicName}/${subscriptionName} - ${this.getSubQueueType(channel)}`,
                donePercentage: 0,
                progressBarMessage: `No messages cleared, 0%`,
            })
        );

        return zip(from(adminClient.getSubscriptionRuntimeProperties(topicName, subscriptionName)), this.readMessages(receiver)).pipe(
            finalize(async () => {
                await receiver.close();
                await client.close();
            }),
            tap(([runtimeProperties, update]) => {
                let messageCount = 0;
                switch (channel) {
                    case MessagesChannel.deadletter:
                        messageCount = runtimeProperties.deadLetterMessageCount;
                        break;
                    case MessagesChannel.transferedDeadletters:
                        messageCount = runtimeProperties.transferDeadLetterMessageCount;
                        break;
                    default:
                        messageCount = runtimeProperties.activeMessageCount;
                        break;
                }

                if (update instanceof LoadStatusUpdate) {
                    const percentage = this.getPercentage(update.totalLoaded, messageCount);
                    const progressBarMessage = `Loaded ${update.totalLoaded} of ${messageCount} messages, ${percentage}%`;

                    const action =
                        update.loadStatus === 'loading'
                            ? updateTaskDonePercentage({
                                  id: taskId,
                                  donePercentage: percentage,
                                  progressBarMessage,
                              })
                            : finishTask({ id: taskId });
                    this.store.dispatch(action);
                }
            }),
            map(() => void 0)
        );
    }

    private getQueuesMessagesInternal(
        connection: IConnection,
        queueName: string,
        channel: MessagesChannel,
        numberOfMessages: number,
        skip?: number,
        fromSequenceNumber?: Long
    ): Observable<LoadStatusUpdate | IMessage[]> {
        const client = this.connectionService.getClient(connection);
        const receiver = client.createReceiver(queueName, {
            subQueueType: this.getSubQueueType(channel),
            skipParsingBodyAsJson: true,
        });

        return this.peakMessages(receiver, numberOfMessages, skip, fromSequenceNumber).pipe(
            finalize(async () => {
                await receiver.close();
                await client.close();
            })
        );
    }

    private getSubscriptionMessagesInternal(
        connection: IConnection,
        topicName: string,
        subscriptionName: string,
        channel: MessagesChannel,
        numberOfMessages: number,
        skip?: number,
        fromSequenceNumber?: Long
    ): Observable<LoadStatusUpdate | IMessage[]> {
        const client = this.connectionService.getClient(connection);
        const receiver = client.createReceiver(topicName, subscriptionName, {
            subQueueType: this.getSubQueueType(channel),
            skipParsingBodyAsJson: true,
        });

        return this.peakMessages(receiver, numberOfMessages, skip, fromSequenceNumber).pipe(
            finalize(async () => {
                await receiver.close();
                await client.close();
            })
        );
    }

    private readMessages(receiver: ServiceBusReceiver, numberOfMessages?: number): Observable<LoadStatusUpdate | IMessage[]> {
        return this.getMessagesInternal(receiver, false, 0, numberOfMessages).pipe(
            catchError((error) => of(new LoadStatusUpdate('error', undefined, error))),
            switchMap((update) => {
                if (update instanceof LoadStatusUpdate) {
                    return of(update);
                }

                const messages = update.map((m) => this.mapMessage(m));
                return from([new LoadStatusUpdate('loaded', messages.length), messages]);
            })
        );
    }

    private peakMessages(
        receiver: ServiceBusReceiver,
        numberOfMessages?: number,
        skip?: number,
        fromSequenceNumber?: Long
    ): Observable<LoadStatusUpdate | IMessage[]> {
        console.log('peakMessages', numberOfMessages, skip, fromSequenceNumber);
        return this.getMessagesInternal(receiver, true, 0, numberOfMessages + (skip ?? 0), fromSequenceNumber).pipe(
            catchError((error) => of(new LoadStatusUpdate('error', undefined, error))),
            switchMap((update) => {
                if (update instanceof LoadStatusUpdate) {
                    return of(
                        new LoadStatusUpdate(update.loadStatus, !update.totalLoaded ? 0 : update.totalLoaded - (skip ?? 0), update.error)
                    );
                }

                const messages = update.slice(skip ?? 0).map((m) => this.mapMessage(m));
                return from([new LoadStatusUpdate('loaded', messages.length), messages]);
            })
        );
    }

    private getMessagesInternal(
        receiver: ServiceBusReceiver,
        peek: boolean,
        numberOfLoadedMessages: number,
        numberOfMessagesYetToReceive?: number,
        fromSequenceNumber?: Long
    ): Observable<LoadStatusUpdate | ServiceBusReceivedMessage[]> {
        if (numberOfMessagesYetToReceive !== undefined && numberOfMessagesYetToReceive <= 0) {
            return of([]);
        }

        const messageFunction = (peek: boolean, maximumMessagesToGet: number, fromSequenceNumber: Long | undefined) => {
            return peek
                ? from(receiver.peekMessages(maximumMessagesToGet, { fromSequenceNumber: fromSequenceNumber }))
                : from(receiver.receiveMessages(maximumMessagesToGet));
        };

        return messageFunction(peek, numberOfMessagesYetToReceive, fromSequenceNumber).pipe(
            mergeMap((messagesPart: ServiceBusReceivedMessage[]) => {
                if (messagesPart.length !== 0) {
                    const newNumberOfLoadedMessages = numberOfLoadedMessages + messagesPart.length;

                    const newNumberOfMessagesYetToReceive =
                        numberOfLoadedMessages === undefined ? undefined : numberOfMessagesYetToReceive - messagesPart.length;

                    const lastSequenceNumber: Long | undefined = messagesPart[messagesPart.length - 1].sequenceNumber;
                    return this.getMessagesInternal(
                        receiver,
                        peek,
                        newNumberOfLoadedMessages,
                        newNumberOfMessagesYetToReceive,
                        lastSequenceNumber.add(1)
                    ).pipe(
                        map((nextPart: ServiceBusReceivedMessage[] | LoadStatusUpdate) => {
                            if (nextPart instanceof LoadStatusUpdate) {
                                return nextPart;
                            }

                            return [...messagesPart, ...nextPart];
                        })
                    );
                }

                return of(messagesPart);
            }),
            startWith(new LoadStatusUpdate('loading', numberOfLoadedMessages))
        );
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

        if (isBuffer(body)) {
            const decoder = new TextDecoder();
            return decoder.decode(body);
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

    private isMessageArray(obj: IMessage[] | LoadStatusUpdate): obj is IMessage[] {
        return !(obj instanceof LoadStatusUpdate);
    }

    private getPercentage(loaded: number, total: number): number {
        const percentage = Math.round((loaded / total) * 1000) / 10;
        return percentage === Infinity ? 0 : percentage;
    }
}
