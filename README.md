<div>
    <br>
    <picture id="theme-default">
        <source srcset="assets/logo-text-dark.png" media="(prefers-color-scheme: dark)" />
        <source srcset="assets/logo-text.png" media="(prefers-color-scheme: light)" />
        <img src="assets/logo-text-dark.png" />
    </picture>
    <br>
</div>

This project aims to build a cross platform tool to manage Azure Servicebus instances.
Currently you are able to:
- View your queues, topics and subscriptions
- View the details of your queues, topics and subscriptions
- Peek (View without deleting) messages in your queues and subscriptions. From the main, deadletter and trasfered dead letter channels
- Send messages to your queues and topics

## How to run
### Installer
Download the Windows, Mac, Linux versions of the app here:
- https://github.com/mligtenberg/ServicebusBrowser/releases

### Manual build (release build)
- Clone the project
- Install the dependencies with ``npm install`` in the main directory
- Build by running ``npm release`` in the main directory

### Manual build (dev enviorment)
- Clone the project
- Install the dependencies with ``npm install`` in the main directory
- Build and start the project by running ``npm start`` in the main directory
