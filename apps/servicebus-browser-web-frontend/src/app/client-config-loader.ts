import { OpenIdConfiguration } from 'angular-auth-oidc-client';

let clientConfig: OpenIdConfiguration | undefined;

export async function initializeClientConfig(): Promise<void> {
  const clientConfigResponse = await fetch('/api/client-config');
  clientConfig = await clientConfigResponse.json();
}

export function getClientConfig() {
  if (!clientConfig) {
    throw new Error('Client configuration is not initialized. Call InitializeClientConfig first.');
  }
  return clientConfig;
}
