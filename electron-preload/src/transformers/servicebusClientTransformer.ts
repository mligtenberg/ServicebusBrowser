import { ServiceBusClient } from "@azure/service-bus";
import receiverTransform from "./servicebusClient/receiverTransformer";

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
        close: () => client.close()
    }
}