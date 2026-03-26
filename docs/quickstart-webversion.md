# Quickstart Guide for Web Version

## Creating the app registration
create a new app registration in the Azure portal with the following settings:
- Authentication:
  - platform type: Single-page application
  - Redirect URI: `https://<service-bus-browser-hostname>`

It is recommended to enable the "assignment required" in the connected enterprise applications settings.
To do this:
- navigate to the enterprise application via the overview page of the app registration.  
- Select the link under the "Managed application in local directory" header
- In the "Properties" section, set "User assignment required?" to "Yes"

## Configure the app
Create a file called `sbb-connections.json`. This file contains an array with the connections provided in the web UI.
Create a second file called `openid-config.json`. This file is directly passed to the [`angular-auth-oidc-client`](https://angular-auth-oidc-client.com/) library.
Reference their [documentation](https://angular-auth-oidc-client.com/docs/documentation/configuration) for information on how to configure the file.

Use the following template if you want to use Microsoft Entra:
```json
{
  "authority":
  "https://login.microsoftonline.com/{tenantId}/v2.0",
  "clientId": "{clientId}",
  "scope": "openid profile api://{clientId}/access",
  "responseType": "code",
  "silentRenew": true,
  "maxIdTokenIatOffsetAllowedInSeconds": 600,
  "issValidationOff": true,
  "autoUserInfo": false,
  "strictIssuerValidationOnWellKnownRetrievalOff": true,
  "useRefreshToken": true,
  "customParamsAuthRequest": {
    "prompt": "select_account"
  }
}

```
For this to work, make sure you configured the access permissions in the app registration.
And make sure the `requestedAccessTokenVersion` in the app registration manifest is set to `2`.


The different connection types are:

Service Bus - connection string:

```json
[
  {
    "id": "<GUID>",
    "type": "connectionString",
    "name": "<NAME>",
    "connectionString": "<CONNECTION_STRING>",
    "target": "serviceBus"
  }
]
```
> [!IMPORTANT]
> While possible, using connection strings in the web version of Service Bus Browser is strongly discouraged due to security concerns. This primarily applies when running the container beyond your local machine; in those scenarios, a secretless option such as managed identities is strongly recommended.

Service Bus - Service principal client secret:
```json
[
  {
    "id": "<GUID>",
    "type": "ServicePrincipalClientSecret",
    "name": "<NAME>",
    "fullyQualifiedNamespace": "<NAMESPACE>",
    "clientId": "<CLIENT_ID>",
    "clientSecret": "<CLIENT_SECRET>",
    "tenantId": "<TENANT_ID>",
    "authority": "<AUTHORITY>",
    "target": "serviceBus"
  }
]
```
> [!IMPORTANT]
> While possible, using service principal secrets in the web version of Service Bus Browser is strongly discouraged due to security concerns. This primarily applies when running the container beyond your local machine; in those scenarios, a secretless option such as managed identities is strongly recommended.

Service Bus - System assigned managed identity:
```json
[
  {
    "id": "<GUID>",
    "type": "systemAssignedManagedIdentity",
    "name": "<NAME>",
    "fullyQualifiedNamespace": "<NAMESPACE>",
    "target": "serviceBus"
  }
]
```

Service Bus - User assigned managed identity:
```json
[
  {
    "id": "<GUID>",
    "type": "userAssignedManagedIdentity",
    "name": "<NAME>",
    "fullyQualifiedNamespace": "<NAMESPACE>",
    "clientId": "<CLIENT_ID>",
    "target": "serviceBus"
  }
]
```

Service Bus - RabbitMQ connection:
```json
[
  {
    "id": "<GUID>",
    "type": "connectionString",
    "name": "<NAME>",
    "host": "<HOST>",
    "managementPort": 15672,
    "amqpPort": 5672,
    "vhost": "/",
    "userName": "<USERNAME>",
    "password": "<PASSWORD>",
    "target": "rabbitmq"
  }
]
```

## run the application
To run the web version, mount both configuration files into the container:
```bash
docker run -p 8080:80\
  --mount type=bind,src=./openid-config.json,dst=/app/openid-config.json\
  --mount type=bind,src=./sbb-connections.json,dst=/app/sbb-connections.json\
  ghcr.io/mligtenberg/servicebusbrowser:main
```
