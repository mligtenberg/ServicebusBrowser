import { Injectable } from '@angular/core';
import { ConnectionService } from '../connections/connection.service';
import { IConnection } from '../connections/ngrx/connections.models';
import { LogService } from '../logging/log.service';
import { IQueue } from './ngrx/queues.models';
import { ServiceBusAdministrationClient, QueueProperties, QueueRuntimeProperties, WithResponse } from '@azure/service-bus';

@Injectable({
  providedIn: 'root',
})
export class QueuesService {
  constructor(
    private connectionService: ConnectionService,
    private log: LogService
  ) {}

  public async getQueues(connection: IConnection): Promise<IQueue[]> {
    this.log.logInfo(`Retrieving queues for connection '${connection.name}'`);
    try {
      const queues = await this.getQueuesInternal(connection);
      this.log.logInfo(`Retrieved ${queues.length} queues for '${connection.name}'`);
      return queues;
    } catch (reason) {
      this.log.logWarning(`Retrieving queues failed: ${reason}`);
      throw reason;
    }
  }

  private async getQueuesInternal(connection: IConnection): Promise<IQueue[]> {
    const client = this.connectionService.getAdminClient(connection);

    const queues = await this.getQueueProperties(client);
    const queueRuntimeProperties = await this.getQueueRuntimeProperties(client);

    return queues.map((q) => {
      const runtimeProperties = queueRuntimeProperties.find(qrp => qrp.name === q.name);

      return {
        name: q.name,
        properties: {
          deadLetteringOnMessageExpiration: q.deadLetteringOnMessageExpiration,
          defaultMessageTimeToLive: q.defaultMessageTimeToLive,
          duplicateDetectionHistoryTimeWindow: q.duplicateDetectionHistoryTimeWindow,
          enableBatchedOperations: q.enableBatchedOperations,
          enableExpress: q.enableExpress,
          enablePartitioning: q.enablePartitioning,
          lockDuration: q.lockDuration,
          maxDeliveryCount: q.maxDeliveryCount,
          maxSizeInMegabytes: q.maxSizeInMegabytes,
          requiresDuplicateDetection: q.requiresDuplicateDetection,
          requiresSession: q.requiresSession,
          userMetadata: q.userMetadata,
          forwardDeadLetteredMessagesTo: q.forwardDeadLetteredMessagesTo,
          forwardTo: q.forwardTo
        },
        info: {
          accessedAt: runtimeProperties?.accessedAt,
          activeMessageCount: runtimeProperties?.activeMessageCount,
          availabilityStatus: q.availabilityStatus,
          createdAt: runtimeProperties?.createdAt,
          deadLetterMessageCount: runtimeProperties?.deadLetterMessageCount,
          modifiedAt: runtimeProperties?.modifiedAt,
          scheduledMessageCount: runtimeProperties?.scheduledMessageCount,
          status: q.status,
          transferDeadLetterMessageCount: runtimeProperties?.transferDeadLetterMessageCount,
          transferMessageCount: runtimeProperties?.transferMessageCount,
          sizeInBytes: runtimeProperties?.sizeInBytes,
          totalMessageCount: runtimeProperties?.totalMessageCount
        },
        authorizationRules: q.authorizationRules ?? []
      } as IQueue;
    });
  }

  private async getQueueProperties(client: ServiceBusAdministrationClient): Promise<QueueProperties[]> {
    let finished = false;
    const queues: QueueProperties[] = [];

    const iterator = client.listQueues();
    do {
      const result = await iterator.next();
      if (result.value) {
        queues.push(result.value);
      }
      finished = result.done ?? false;
    } while (!finished);

    return queues;
  }

  private async getQueueRuntimeProperties(client: ServiceBusAdministrationClient): Promise<QueueRuntimeProperties[]> {
    let finished = false;
    const queues: QueueRuntimeProperties[] = [];

    const iterator = client.listQueuesRuntimeProperties();
    do {
      const result = await iterator.next();
      if (result.value) {
        queues.push(result.value);
      }
      finished = result.done ?? false;
    } while (!finished);

    return queues;
  }

  public async saveQueueProperties(connection: IConnection, queue: IQueue): Promise<void> {
    this.log.logInfo(`Updating queue ${connection.name}/${queue.name}`);

    const client = this.connectionService.getAdminClient(connection);
    const servicebusQueue = await client.getQueue(queue.name);

    servicebusQueue.deadLetteringOnMessageExpiration = queue.properties.deadLetteringOnMessageExpiration;
    servicebusQueue.defaultMessageTimeToLive = queue.properties.defaultMessageTimeToLive;
    servicebusQueue.duplicateDetectionHistoryTimeWindow = queue.properties.duplicateDetectionHistoryTimeWindow;
    servicebusQueue.enableBatchedOperations = queue.properties.enableExpress;
    servicebusQueue.forwardDeadLetteredMessagesTo = queue.properties.forwardDeadLetteredMessagesTo;
    servicebusQueue.forwardTo = queue.properties.forwardTo;
    servicebusQueue.lockDuration = queue.properties.lockDuration;
    servicebusQueue.maxDeliveryCount = queue.properties.maxDeliveryCount;
    servicebusQueue.maxSizeInMegabytes = queue.properties.maxSizeInMegabytes;
    servicebusQueue.userMetadata = queue.properties.userMetadata;

    await client.updateQueue(servicebusQueue);
    this.log.logInfo(`Updated queue ${connection.name}/${queue.name} succesfully`);
  }
}
