import { jwtVerify, createRemoteJWKSet } from 'jose';
import * as process from 'node:process';

export const OIDC_ISSUER = process.env['OIDC_ISSUER'];
export const EXPECTED_AUDIENCE = process.env['EXPECTED_AUDIENCE'];

export async function validateJWT(token: string) {
  try {
    const wellKnownUrl = `${OIDC_ISSUER}/.well-known/openid-configuration`;
    console.log(`WellKnownUrl: ${wellKnownUrl}`);

    // Step 1: Fetch OIDC Configuration
    const oidcResponse = await fetch(wellKnownUrl);
    if (!oidcResponse.ok) throw new Error('Failed to fetch OIDC configuration');
    const oidcConfig = await oidcResponse.json();

    // Step 2: Fetch JWKS
    const JWKS = createRemoteJWKSet(new URL(oidcConfig.jwks_uri));

    // Step 3: Verify JWT
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: oidcConfig.issuer,
      audience: EXPECTED_AUDIENCE,
    });

    return payload;
  }
  catch (error) {
    console.error('JWT validation failed:', error);
    return null;
  }
}
