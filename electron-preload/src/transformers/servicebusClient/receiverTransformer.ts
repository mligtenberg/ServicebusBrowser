import { ServiceBusReceiver } from "@azure/service-bus";


export default function(receiver: ServiceBusReceiver) {
    return {
        receiveMessages: async (maxMessageCount: number) =>  await receiver.receiveMessages(maxMessageCount),
        peekMessages: async (maxMessageCount: number) => await receiver.peekMessages(maxMessageCount),
        close: async () => await receiver.close()
    }
}
