import { jwtVerify, createRemoteJWKSet } from 'jose';
import * as process from 'node:process';
import * as fs from 'node:fs';

export async function validateJWT(token: string) {
  try {
    // Step 1: Fetch OIDC Configuration
    const oidcConfig = await getOidcConfig();

    // Step 2: Fetch JWKS
    const JWKS = createRemoteJWKSet(new URL(oidcConfig.openIdConfig.jwks_uri));

    // Step 3: Verify JWT
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: oidcConfig.openIdConfig.issuer,
      audience: oidcConfig.clientConfig.clientId,
    });

    return payload;
  }
  catch (error) {
    console.error('JWT validation failed:', error);
    return null;
  }
}

let config: any;
let lastFetchedOn: Date | undefined;
export async function getOidcConfig() {
  const openidConfigPath = `${process.cwd()}/openid-config.json`;
  const configExists = await import('fs/promises')
    .then(fs => fs.access(openidConfigPath)
      .then(() => true).catch(() => false));
  if (!configExists) {
    throw new Error('OpenID configuration file not found');
  }

  const clientConfig = JSON.parse(fs.readFileSync(openidConfigPath, 'utf8'));
  const wellKnownUrl =
    clientConfig.authWellknownEndpointUrl ?? clientConfig.authority;

  if (!config || !lastFetchedOn || Date.now() - lastFetchedOn.getTime() > 1000 * 60 * 60) {
    const response = await fetch(`${wellKnownUrl}/.well-known/openid-configuration`);
    config = await response.json();
    lastFetchedOn = new Date();
  }

  return {
    clientConfig: clientConfig,
    openIdConfig: config,
  };
}
