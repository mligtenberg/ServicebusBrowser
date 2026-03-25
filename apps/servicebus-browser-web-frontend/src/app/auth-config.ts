import { Injectable } from '@angular/core';
import { StsConfigLoader, OpenIdConfiguration } from 'angular-auth-oidc-client';
import { Observable, of } from 'rxjs';
import {
  getClientConfig,
} from './client-config-loader';

@Injectable({
  providedIn: 'root',
})
export class ClientConfigStsLoader implements StsConfigLoader {
  loadConfigs(): Observable<OpenIdConfiguration[]> {
    return of([
      {
        ...getClientConfig(),
        secureRoutes: ['/api/'],
        redirectUrl: `${window.location.origin}/oidc-callback`,
      },
    ])
  }
}
