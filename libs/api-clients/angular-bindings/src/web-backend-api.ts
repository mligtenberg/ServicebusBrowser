import { HttpClient } from '@angular/common/http';
import { firstValueFrom, lastValueFrom, map } from 'rxjs';
import { BackendApi } from '@service-bus-browser/service-bus-frontend-clients';
import { Workspace, UUID } from '@service-bus-browser/shared-contracts';
import { BSON } from 'bson';

/**
 * Single backend handler for the web variant.
 *
 * - management / serviceBusManagement / messages requests are POSTed to the
 *   web backend, which executes them via the shared Server instance.
 * - workspaces requests are handled locally against localStorage, because the
 *   web variant has no server-side workspace registry. The shape mirrors the
 *   desktop variant's sbb-workspaces.json so callers stay platform-agnostic.
 */
export class WebBackendApi implements BackendApi {
  private static readonly WORKSPACE_STORAGE_KEY = 'sbb-workspace';

  constructor(
    private readonly baseUrl: string,
    private readonly httpClient: HttpClient,
  ) {}

  async managementDoRequest(
    requestType: string,
    request: unknown,
  ): Promise<unknown> {
    return await lastValueFrom(
      this.httpClient
        .post(
          `${this.baseUrl}management/command`,
          { requestType, body: request },
          {
            headers: { 'Content-Type': 'application/json' },
            responseType: 'blob',
          },
        )
        .pipe(map((response) => this.decodeResponse(response))),
    );
  }

  async messagesDoRequest(
    requestType: string,
    request: unknown,
  ): Promise<unknown> {
    return await firstValueFrom(
      this.httpClient
        .post(
          `${this.baseUrl}messages/command`,
          { requestType, body: request },
          {
            headers: { 'Content-Type': 'application/json' },
            responseType: 'blob',
          },
        )
        .pipe(map((response) => this.decodeResponse(response))),
    );
  }

  async serviceBusManagementDoRequest(
    requestType: string,
    request: unknown,
  ): Promise<unknown> {
    return await firstValueFrom(
      this.httpClient
        .post(
          `${this.baseUrl}service-bus-management/command`,
          { requestType, body: request },
          {
            headers: { 'Content-Type': 'application/json' },
            responseType: 'blob',
          },
        )
        .pipe(map((response) => this.decodeResponse(response))),
    );
  }

  async workspacesDoRequest(
    requestType: string,
    _request: unknown,
  ): Promise<unknown> {
    switch (requestType) {
      case 'getActiveWorkspace':
        return this.getActiveWorkspace();
      default:
        throw new Error(`Unknown workspaces request: ${requestType}`);
    }
  }

  private getActiveWorkspace(): Workspace {
    const stored = localStorage.getItem(WebBackendApi.WORKSPACE_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as Workspace;
    }

    const workspace: Workspace = {
      id: crypto.randomUUID() as UUID,
      name: 'Default',
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(
      WebBackendApi.WORKSPACE_STORAGE_KEY,
      JSON.stringify(workspace),
    );
    return workspace;
  }

  private async decodeResponse(response: Blob): Promise<any> {
    const document = BSON.deserialize(await response.bytes());

    // binary data is returned as a buffer, but we use uInt8Arrays
    const convertBuffers = (obj: any): any => {
      if (typeof obj === 'object' && obj !== null && 'buffer' in obj) {
        return obj.buffer;
      } else if (Array.isArray(obj)) {
        return obj.map(convertBuffers);
      } else if (typeof obj === 'object' && obj !== null) {
        return Object.fromEntries(
          Object.entries(obj).map(([key, value]) => [
            key,
            convertBuffers(value),
          ]),
        );
      }
      return obj;
    };

    return convertBuffers(document['result']);
  }
}
