export interface ApiHandler {
  serviceBusManagementDoRequest(
    requestType: string,
    request: unknown,
  ): Promise<unknown>;
  managementDoRequest(requestType: string, request: unknown): Promise<unknown>;
  messagesDoRequest(requestType: string, request: unknown): Promise<unknown>;
}
