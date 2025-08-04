# Quickstart Guide for Web Version

## Creating the app registration
create a new app registration in the Azure portal with the following settings:
- Authentication:
  - platform type: Single-page application
  - Redirect URI: `https://<service-bus-browser-hostname`

It is recommended to enable the "assignment required" in the connected enterprise applications settings.
To do this:
- navigate to the enterprise application via the overview page of the app registration.  
- Select the link under the "Managed application in local directory" header
- In the "Properties" section, set "User assignment required?" to "Yes"

## deploy to azure
TODO, add a link to the deployment script
![Deploy to Azure](https://aka.ms/deploytoazurebutton)
