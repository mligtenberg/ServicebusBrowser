# Servicebus Browser
This project aims to build a cross platform tool to manage Azure Servicebus instances

## How to run
### Installer
Download the Windows and Linux versions of the app here:
- https://github.com/mligtenberg/ServicebusBrowser/releases

### Manual build (release build)
- Clone the project
- Install the dependencies with ``npm install`` in the main directory
- Build by running ``npm release`` in the main directory

### Manual build (dev enviorment)
- Clone the project
- Install the dependencies with ``npm install`` in the main directory
- Build and start the frontend by running ``npm start`` in the frontend directory
- Build and start the electron app by running ``npm run start:ngServe`` in the electron-main directory