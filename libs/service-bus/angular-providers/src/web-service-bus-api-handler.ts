import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export class WebServiceBusApiHandler {
  constructor(
    private readonly baseUrl: string,
    private readonly httpClient: HttpClient,
  ) {}

  async managementDoRequest(requestType: string, request: unknown): Promise<unknown> {
    return await firstValueFrom(this.httpClient.post(`${this.baseUrl}management/command`, {
      requestType,
      body: request,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    }));
  }

  async messagesDoRequest(requestType: string, request: unknown): Promise<unknown> {
    return await firstValueFrom(this.httpClient.post(`${this.baseUrl}messages/command`, {
      requestType,
      body: request,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    }));
  }
}
