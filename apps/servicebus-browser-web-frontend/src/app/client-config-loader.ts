let clientConfig: { clientId: string, authority: string } | undefined;

export async function initializeClientConfig(): Promise<void> {
  const clientConfigResponse = await fetch('/api/client-config');
  clientConfig = await clientConfigResponse.json() as {
    clientId: string;
    authority: string;
  };
}

export function getClientConfig() {
  if (!clientConfig) {
    throw new Error('Client configuration is not initialized. Call InitializeClientConfig first.');
  }
  return clientConfig;
}
