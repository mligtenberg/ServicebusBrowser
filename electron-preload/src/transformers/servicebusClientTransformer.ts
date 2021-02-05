import { ServiceBusClient } from "@azure/service-bus";
import receiverTransform from "./servicebusClient/receiverTransformer";
import senderTransformer from "./servicebusClient/senderTransformer";

export default function (client: ServiceBusClient) {
    return {
        createReceiver: (queueName: string, options: {
            receiveMode?: "peekLock" | "receiveAndDelete";
            subQueueType?: "deadLetter" | "transferDeadLetter";
            maxAutoLockRenewalDurationInMs?: number;
        }) => {
            const receiver = client.createReceiver(queueName, options);
            return receiverTransform(receiver);
        },
        createSender: (queueOrTopicName: string) => {
            const sender = client.createSender(queueOrTopicName);
            return senderTransformer(sender);
        },
        close: () => client.close()
    }
}