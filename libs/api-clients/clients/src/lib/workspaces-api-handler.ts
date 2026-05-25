export interface WorkspacesApiHandler {
  workspacesDoRequest(requestType: string, request: unknown): Promise<unknown>;
}
