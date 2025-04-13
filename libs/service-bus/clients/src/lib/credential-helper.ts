import { Connection } from "@service-bus-browser/service-bus-contracts";
import { TokenCredential, ManagedIdentityCredential, InteractiveBrowserCredential } from '@azure/identity';

export function getCredential(connection: Connection): TokenCredential {
    if (connection.type !== 'azureAD') {
        throw new Error(`Unsupported connection type: ${connection.type}`);
    }
    
    const { authMethod  } = connection;
    
    switch (authMethod) {
    case 'currentUser':
        const { email } = connection;
        return new InteractiveBrowserCredential({
        loginHint: email,
        redirectUri: window.location.origin,
        
        });
    case 'systemAssignedManagedIdentity':
        return new ManagedIdentityCredential();
    case 'userAssignedManagedIdentity':
        const {clientId} = connection;
        return new ManagedIdentityCredential(clientId);
    default:
        throw new Error(`Unsupported auth method: ${authMethod}`);
    }
}