import { Injectable } from '@angular/core';
import { LogService } from '../logging/log.service';
import { ITopic, ISubscription } from './ngrx/topics.models';
import {
    TopicRuntimeProperties,
    SubscriptionRuntimeProperties,
    ServiceBusAdministrationClient,
    SubscriptionProperties,
    TopicProperties,
} from '@azure/service-bus';
import { ConnectionService } from '../connections/connection.service';
import { IConnection } from '../connections/ngrx/connections.models';

@Injectable({
    providedIn: 'root',
})
export class TopicsService {
    constructor(private connectionService: ConnectionService, private log: LogService) {}

    public async getTopics(connection: IConnection): Promise<ITopic[]> {
        this.log.logInfo(`Retrieving topics for connection '${connection.name}'`);
        try {
            const topics = await this.getTopicsInternal(connection);
            this.log.logInfo(`Retrieved ${topics.length} topics for '${connection.name}'`);
            return topics;
        } catch (reason) {
            this.log.logWarning(`Retrieving topics failed: ${reason}`);
            throw reason;
        }
    }

    private async getTopicsInternal(connection: IConnection): Promise<ITopic[]> {
        const client = this.connectionService.getAdminClient(connection);
        const runtimePropertiesList: TopicRuntimeProperties[] = await this.getTopicRuntimeProperties(client);
        const topics: TopicProperties[] = await this.getTopicProperties(client);
        return topics.map((t) => {
            const runtimeProperties = runtimePropertiesList.find((rp) => t.name === rp.name);
            return {
                name: t.name,
                properties: {
                    autoDeleteOnIdle: t.autoDeleteOnIdle,
                    defaultMessageTimeToLive: t.defaultMessageTimeToLive,
                    duplicateDetectionHistoryTimeWindow: t.duplicateDetectionHistoryTimeWindow,
                    enableBatchedOperations: t.enableBatchedOperations,
                    enableExpress: t.enableExpress,
                    enablePartitioning: t.enablePartitioning,
                    maxSizeInMegabytes: t.maxSizeInMegabytes,
                    requiresDuplicateDetection: t.requiresDuplicateDetection,
                    supportOrdering: t.supportOrdering,
                    userMetadata: t.userMetadata,
                    authorizationRules: t.authorizationRules,
                },
                info: {
                    status: t.status,
                    availabilityStatus: t.availabilityStatus,
                    accessedAt: runtimeProperties?.accessedAt,
                    createdAt: runtimeProperties?.createdAt,
                    modifiedAt: runtimeProperties?.modifiedAt,
                    scheduledMessageCount: runtimeProperties?.scheduledMessageCount,
                    sizeInBytes: runtimeProperties?.sizeInBytes,
                    subscriptionCount: runtimeProperties?.subscriptionCount,
                },
            } as ITopic;
        });
    }

    private async getTopicProperties(client: ServiceBusAdministrationClient): Promise<TopicProperties[]> {
        let finished = false;
        const topics: TopicProperties[] = [];

        const iterator = client.listTopics();
        do {
            const result = await iterator.next();
            if (result.value) {
                topics.push(result.value);
            }
            finished = result.done ?? true;
        } while (!finished);
        return topics;
    }

    private async getTopicRuntimeProperties(client: ServiceBusAdministrationClient): Promise<TopicRuntimeProperties[]> {
        let finished = false;
        const topics: TopicRuntimeProperties[] = [];

        const iterator = client.listTopicsRuntimeProperties();
        do {
            const result = await iterator.next();
            if (result.value) {
                topics.push(result.value);
            }
            finished = result.done ?? true;
        } while (!finished);
        return topics;
    }

    public async updateTopic(connection: IConnection, topic: ITopic): Promise<void> {
        const client = this.connectionService.getAdminClient(connection);
        const servicebusTopic = await client.getTopic(topic.name);

        servicebusTopic.autoDeleteOnIdle = topic.properties.autoDeleteOnIdle;
        servicebusTopic.defaultMessageTimeToLive = topic.properties.defaultMessageTimeToLive;
        servicebusTopic.duplicateDetectionHistoryTimeWindow = topic.properties.duplicateDetectionHistoryTimeWindow;
        servicebusTopic.enableBatchedOperations = topic.properties.enableBatchedOperations;
        servicebusTopic.maxSizeInMegabytes = topic.properties.maxSizeInMegabytes;
        servicebusTopic.supportOrdering = topic.properties.supportOrdering;
        servicebusTopic.userMetadata = topic.properties.userMetadata;

        await client.updateTopic(servicebusTopic);
    }
}
