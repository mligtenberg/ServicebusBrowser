import { OperationOptionsBase, ServiceBusMessage, ServiceBusMessageBatch, ServiceBusSender } from "@azure/service-bus";


export default function(sender: ServiceBusSender) {
    return {
        sendMessages: async (messages: ServiceBusMessage | ServiceBusMessage[] | ServiceBusMessageBatch, options?: OperationOptionsBase) => await sender.sendMessages(messages, options),
        close: async () => await sender.close()
    }
}
