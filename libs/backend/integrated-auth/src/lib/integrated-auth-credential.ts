import type {
  AccessToken,
  GetTokenOptions,
  TokenCredential,
} from '@azure/core-auth';

/**
 * Application (client) id of the Azure CLI. This is a well-known Microsoft
 * first-party public client that is broadly pre-authorized for Azure resources
 * such as Service Bus and Event Hubs, which makes it suitable for an
 * interactive sign-in flow without registering an own app.
 */
export const AZURE_CLI_CLIENT_ID = '04b07795-8ddb-461a-bbee-02f9e1bf7b46';

export interface IntegratedAuthTokenRequest {
  /** Email of the account to sign in with. Used to reuse a cached session. */
  email: string;
  /** Application (client) id to authenticate against. */
  clientId: string;
  /** Scopes requested by the Azure SDK (e.g. https://servicebus.azure.net/.default). */
  scopes: string[];
  /**
   * Optional directory (tenant) id to authenticate against. Required for guest
   * (B2B) accounts: without it the user is signed in to their home tenant and
   * the token is not valid for resources in the host tenant.
   */
  tenantId?: string;
}

export interface IntegratedAuthCredentialOptions {
  clientId?: string;
  tenantId?: string;
}

/**
 * Acquires tokens through an interactive sign-in. The concrete implementation
 * lives in the Electron main process (it opens a popup window and persists the
 * token cache), and is registered at app bootstrap via
 * {@link registerIntegratedAuthTokenProvider}. Keeping it behind this interface
 * means the messaging-broker libraries stay free of any Electron/MSAL coupling.
 */
export interface IntegratedAuthTokenProvider {
  getToken(request: IntegratedAuthTokenRequest): Promise<AccessToken>;
}

let provider: IntegratedAuthTokenProvider | undefined;

export function registerIntegratedAuthTokenProvider(
  tokenProvider: IntegratedAuthTokenProvider,
): void {
  provider = tokenProvider;
}

/**
 * A {@link TokenCredential} that delegates token acquisition to the registered
 * {@link IntegratedAuthTokenProvider}. Sessions are reused per email.
 */
export class IntegratedAuthCredential implements TokenCredential {
  private readonly clientId: string;
  private readonly tenantId?: string;

  constructor(
    private readonly email: string,
    options: IntegratedAuthCredentialOptions = {},
  ) {
    this.clientId = options.clientId ?? AZURE_CLI_CLIENT_ID;
    this.tenantId = options.tenantId;
  }

  async getToken(
    scopes: string | string[],
    _options?: GetTokenOptions,
  ): Promise<AccessToken | null> {
    if (!provider) {
      throw new Error(
        'Integrated auth token provider has not been registered. ' +
          'This connection requires the desktop app.',
      );
    }

    const scopeArray = Array.isArray(scopes) ? scopes : [scopes];
    return provider.getToken({
      email: this.email,
      clientId: this.clientId,
      scopes: scopeArray,
      tenantId: this.tenantId,
    });
  }
}
