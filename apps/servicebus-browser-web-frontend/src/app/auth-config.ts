import { Injectable } from '@angular/core';
import { StsConfigLoader, OpenIdConfiguration } from 'angular-auth-oidc-client';
import { Observable, of } from 'rxjs';
import { getClientConfig } from './client-config-loader';

@Injectable()
export class ClientConfigStsLoader implements StsConfigLoader {
  loadConfigs(): Observable<OpenIdConfiguration[]> {
    const clientConfig = getClientConfig();
    return of([
      {
        authority: clientConfig.authority,
        redirectUrl: `${window.location.origin}/`,
        postLogoutRedirectUri: `${window.location.origin}/`,
        clientId: clientConfig.clientId,
        scope: 'openid profile',
        responseType: 'code',
        silentRenew: true,
        useRefreshToken: true,
        secureRoutes: ['/api/'],
        unauthorizedRoute: '/login-failed',
      },
    ]);
  }
}
