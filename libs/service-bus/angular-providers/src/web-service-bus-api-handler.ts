export class WebServiceBusApiHandler {
  constructor(private readonly baseUrl: string) {}

  async managementDoRequest(requestType: string, request: unknown): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}management/command`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requestType,
        body: request,
      }),
    });
    return response.json();
  }

  async messagesDoRequest(requestType: string, request: unknown): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}messages/command`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requestType,
        body: request,
      }),
    });
    return response.json();
  }
}
