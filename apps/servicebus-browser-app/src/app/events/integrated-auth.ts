import { BrowserWindow, safeStorage } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import {
  type ICachePlugin,
  type TokenCacheContext,
  CryptoProvider,
  PublicClientApplication,
} from '@azure/msal-node';
import {
  type IntegratedAuthTokenProvider,
  type IntegratedAuthTokenRequest,
  registerIntegratedAuthTokenProvider,
} from '@service-bus-browser/integrated-auth';
import type { AccessToken } from '@azure/core-auth';
import App from '../app';

const DEFAULT_AUTHORITY = 'https://login.microsoftonline.com/organizations';

function authorityFor(tenantId?: string): string {
  return tenantId
    ? `https://login.microsoftonline.com/${tenantId}`
    : DEFAULT_AUTHORITY;
}
// Loopback redirect registered for the Azure CLI public client. The sign-in
// popup never actually loads it; we intercept the navigation to read the code.
const REDIRECT_URI = 'http://localhost';

/**
 * Interactive Azure sign-in for the desktop app. Opens an Electron popup,
 * runs the MSAL authorization-code + PKCE flow, and persists the token cache
 * per email (encrypted with the OS keychain via safeStorage) so the same email
 * reuses its session across restarts.
 */
class ElectronMsalAuthProvider implements IntegratedAuthTokenProvider {
  private readonly clients = new Map<string, PublicClientApplication>();
  // Serialize getToken per email so a flurry of SDK calls opens one popup.
  private readonly inFlight = new Map<string, Promise<AccessToken>>();

  constructor(private readonly userDataPath: string) {}

  async getToken(request: IntegratedAuthTokenRequest): Promise<AccessToken> {
    const key = this.clientKey(request);
    const pending = this.inFlight.get(key);
    if (pending) {
      return pending;
    }

    const promise = this.acquireToken(request).finally(() => {
      this.inFlight.delete(key);
    });
    this.inFlight.set(key, promise);
    return promise;
  }

  private async acquireToken(
    request: IntegratedAuthTokenRequest,
  ): Promise<AccessToken> {
    const { email, scopes } = request;
    const pca = this.getClient(request);

    const accounts = await pca.getTokenCache().getAllAccounts();
    const target = email.toLowerCase();
    // Each cache file is dedicated to one (clientId, tenantId, email). Match the
    // entered email against the account, but for guest (B2B) accounts the
    // username is the `#EXT#` UPN rather than the email, so fall back to the
    // sole cached account so the session is still reused after a restart.
    const account =
      accounts.find(
        (candidate) =>
          candidate.username?.toLowerCase() === target ||
          (candidate.idTokenClaims as { email?: string; preferred_username?: string } | undefined)
            ?.email?.toLowerCase() === target ||
          (candidate.idTokenClaims as { email?: string; preferred_username?: string } | undefined)
            ?.preferred_username?.toLowerCase() === target,
      ) ?? (accounts.length === 1 ? accounts[0] : undefined);

    if (account) {
      try {
        const silent = await pca.acquireTokenSilent({ account, scopes });
        if (silent) {
          return this.toAccessToken(silent.accessToken, silent.expiresOn);
        }
      } catch {
        // Silent acquisition failed (e.g. expired refresh token); fall back to
        // an interactive sign-in below.
      }
    }

    const cryptoProvider = new CryptoProvider();
    const { verifier, challenge } = await cryptoProvider.generatePkceCodes();

    const authUrl = await pca.getAuthCodeUrl({
      scopes,
      redirectUri: REDIRECT_URI,
      loginHint: email,
      codeChallenge: challenge,
      codeChallengeMethod: 'S256',
    });

    const code = await this.acquireCodeInteractively(authUrl);

    const result = await pca.acquireTokenByCode({
      scopes,
      redirectUri: REDIRECT_URI,
      code,
      codeVerifier: verifier,
    });

    if (!result) {
      throw new Error('Sign-in did not return an access token.');
    }

    return this.toAccessToken(result.accessToken, result.expiresOn);
  }

  private clientKey(request: {
    clientId: string;
    email: string;
    tenantId?: string;
  }): string {
    return `${request.clientId}:${request.tenantId ?? 'organizations'}:${request.email.toLowerCase()}`;
  }

  private getClient(request: {
    clientId: string;
    email: string;
    tenantId?: string;
  }): PublicClientApplication {
    const key = this.clientKey(request);
    let pca = this.clients.get(key);
    if (pca) {
      return pca;
    }

    pca = new PublicClientApplication({
      auth: {
        clientId: request.clientId,
        authority: authorityFor(request.tenantId),
      },
      cache: { cachePlugin: this.createCachePlugin(key) },
    });
    this.clients.set(key, pca);
    return pca;
  }

  private createCachePlugin(cacheKey: string): ICachePlugin {
    const cacheFile = this.cacheFilePath(cacheKey);

    return {
      beforeCacheAccess: async (context: TokenCacheContext) => {
        try {
          if (!fs.existsSync(cacheFile)) {
            return;
          }
          const raw = fs.readFileSync(cacheFile);
          let decrypted: string | undefined;
          if (safeStorage.isEncryptionAvailable()) {
            try {
              decrypted = safeStorage.decryptString(raw);
            } catch {
              // File may have been written as plaintext on a run where
              // encryption was unavailable; fall back to reading it directly.
              decrypted = raw.toString('utf8');
            }
          } else {
            decrypted = raw.toString('utf8');
          }
          if (decrypted) {
            context.tokenCache.deserialize(decrypted);
          }
        } catch {
          // Corrupt or unreadable cache: start fresh.
        }
      },
      afterCacheAccess: async (context: TokenCacheContext) => {
        if (!context.cacheHasChanged) {
          return;
        }
        try {
          const serialized = context.tokenCache.serialize();
          const payload = safeStorage.isEncryptionAvailable()
            ? safeStorage.encryptString(serialized)
            : Buffer.from(serialized, 'utf8');
          fs.writeFileSync(cacheFile, payload);
        } catch {
          // Persisting the cache failed; the session simply won't be reused.
        }
      },
    };
  }

  private cacheFilePath(cacheKey: string): string {
    const hash = crypto
      .createHash('sha256')
      .update(cacheKey.toLowerCase())
      .digest('hex')
      .slice(0, 32);
    return path.join(this.userDataPath, `sbb-auth-${hash}.bin`);
  }

  private acquireCodeInteractively(authUrl: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const authWindow = new BrowserWindow({
        parent: App.mainWindow ?? undefined,
        // Not modal: a modal child renders as a frameless sheet on macOS, which
        // traps the user on dead-end sign-in error pages (no close control).
        // A normal framed window can always be closed to cancel the flow.
        modal: false,
        width: 500,
        height: 720,
        autoHideMenuBar: true,
        title: 'Sign in',
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        },
      });

      // Allow Escape to cancel the sign-in.
      authWindow.webContents.on('before-input-event', (event, input) => {
        if (input.type === 'keyDown' && input.key === 'Escape') {
          event.preventDefault();
          if (!authWindow.isDestroyed()) {
            authWindow.close();
          }
        }
      });

      let settled = false;
      const finish = (action: () => void) => {
        settled = true;
        action();
        if (!authWindow.isDestroyed()) {
          authWindow.close();
        }
      };

      const handleRedirect = (url: string): boolean => {
        if (!url.startsWith(REDIRECT_URI)) {
          return false;
        }
        const parsed = new URL(url);
        const code = parsed.searchParams.get('code');
        const error = parsed.searchParams.get('error');
        if (code) {
          finish(() => resolve(code));
        } else {
          finish(() =>
            reject(
              new Error(
                parsed.searchParams.get('error_description') ??
                  error ??
                  'Sign-in failed.',
              ),
            ),
          );
        }
        return true;
      };

      const onNavigate = (event: Electron.Event, url: string) => {
        if (handleRedirect(url)) {
          event.preventDefault();
        }
      };

      authWindow.webContents.on('will-redirect', onNavigate);
      authWindow.webContents.on('will-navigate', onNavigate);
      authWindow.on('closed', () => {
        if (!settled) {
          reject(new Error('Sign-in window was closed before completing.'));
        }
      });

      authWindow.loadURL(authUrl);
    });
  }

  private toAccessToken(
    token: string,
    expiresOn: Date | null,
  ): AccessToken {
    return {
      token,
      expiresOnTimestamp: expiresOn?.getTime() ?? Date.now() + 60 * 60 * 1000,
    };
  }
}

export function registerIntegratedAuth(userDataPath: string): void {
  registerIntegratedAuthTokenProvider(
    new ElectronMsalAuthProvider(userDataPath),
  );
}
