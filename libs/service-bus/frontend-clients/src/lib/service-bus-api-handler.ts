export interface ServiceBusApiHandler {
  managementDoRequest(requestType: string, request: unknown): Promise<unknown>;
  messagesDoRequest(requestType: string, request: unknown): Promise<unknown>;
}
