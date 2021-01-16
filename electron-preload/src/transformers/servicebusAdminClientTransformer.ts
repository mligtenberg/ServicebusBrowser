import { ServiceBusAdministrationClient } from "@azure/service-bus";

export default function (adminClient: ServiceBusAdministrationClient) {
    return {
        listQueues: () => adminClient.listQueues(),
        listQueuesRuntimeProperties: () => adminClient.listQueuesRuntimeProperties(),
        listTopics: () => adminClient.listTopics(),
        listTopicsRuntimeProperties: () => adminClient.listTopicsRuntimeProperties(),
        listSubscriptions: (topicName: string) => adminClient.listSubscriptions(topicName),
        listSubscriptionsRuntimeProperties: (topicName: string) => adminClient.listSubscriptionsRuntimeProperties(topicName),
    }
}