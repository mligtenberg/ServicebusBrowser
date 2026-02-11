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
create a file called `sbb-connections.json`, this file contains a array with the connections provided in the web ui
the different connections types are:

connection string:
```json
[
  {
    "id": "<GUID>",
    "type": "connectionString",
    "name": "<NAME>",
    "connectionString": "<CONNECTION_STRING>"
  }
]
```
> [!IMPORTANT]
> While possible, using connection strings in the web version of Service Bus Browser is strongly discouraged due to security concerns. This primarily applies when running the container beyond your local machine; in those scenarios, a secretless option such as managed identities is strongly recommended.

Service principal client secret:
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
    "authority": "<AUTHORITY>"
  }
]
```
> [!IMPORTANT]
> While possible, using service principal secrets in the web version of Service Bus Browser is strongly discouraged due to security concerns. This primarily applies when running the container beyond your local machine; in those scenarios, a secretless option such as managed identities is strongly recommended.

System assigned managed identity:
```json
[
  {
    "id": "<GUID>",
    "type": "systemAssignedManagedIdentity",
    "name": "<NAME>",
    "fullyQualifiedNamespace": "<NAMESPACE>"
  }
]
```

User assigned managed identity:
```json
[
  {
    "id": "<GUID>",
    "type": "userAssignedManagedIdentity",
    "name": "<NAME>",
    "fullyQualifiedNamespace": "<NAMESPACE>",
    "clientId": "<CLIENT_ID>"
  }
]
```

## run the application
To run the web version run the following docker command:
```bash
docker run -p 8080:80\
  -e "EXPECTED_AUDIENCE=<clientId>"\
  -e "OIDC_ISSUER=<AUTHORITY>"\
  --mount type=bind,src=./sbb-connections.json,dst=/app/sbb-connections.json\
  ghcr.io/mligtenberg/servicebusbrowser:main
```
