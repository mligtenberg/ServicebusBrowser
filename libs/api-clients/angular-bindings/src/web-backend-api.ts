import { HttpClient } from '@angular/common/http';
import { firstValueFrom, lastValueFrom, map } from 'rxjs';
import { BackendApi } from '@service-bus-browser/service-bus-frontend-clients';
import { BSON } from 'bson';

/**
 * Single backend handler for the web variant.
 *
 * All four request categories (management, serviceBusManagement, messages,
 * workspaces) are POSTed to the web backend. The workspaces endpoint exposes
 * the operator-configured workspace list; workspace mutations (create/rename/
 * delete) are not supported on web — the operator edits the config file.
 */
export class WebBackendApi implements BackendApi {
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
    request: unknown,
  ): Promise<unknown> {
    return await firstValueFrom(
      this.httpClient
        .post(
          `${this.baseUrl}workspaces/command`,
          { requestType, body: request },
          {
            headers: { 'Content-Type': 'application/json' },
            responseType: 'blob',
          },
        )
        .pipe(map((response) => this.decodeResponse(response))),
    );
  }

  private async decodeResponse(response: Blob): Promise<any> {
    const document = BSON.deserialize(await response.bytes());

    // binary data is returned as a buffer, but we use uInt8Arrays
    const convertBuffers = (obj: any): any => {
      if (obj instanceof Date) {
        return obj;
      } else if (typeof obj === 'object' && obj !== null && 'buffer' in obj) {
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
