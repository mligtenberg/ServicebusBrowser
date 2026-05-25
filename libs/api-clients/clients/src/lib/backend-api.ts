export interface BackendApi {
  managementDoRequest(
    requestType: string,
    request: unknown,
  ): Promise<unknown>;
  serviceBusManagementDoRequest(
    requestType: string,
    request: unknown,
  ): Promise<unknown>;
  messagesDoRequest(requestType: string, request: unknown): Promise<unknown>;
  workspacesDoRequest(requestType: string, request: unknown): Promise<unknown>;
}
