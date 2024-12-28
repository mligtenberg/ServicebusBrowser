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
Download the Windows, Linux versions of the app here:
- https://github.com/mligtenberg/ServicebusBrowser/releases

For mac users a manual release is advised for now
since the build is required to be signed.

### Manual build (release build)
#### Requirements
- Node V20
- PNPM V9

#### Steps
- Clone the project
- Install the dependencies with ``pnpm install`` in the main directory
- Build by running ``pnpm exec nx run-many -t build make`` in the main directory

### Manual build (dev enviorment)
- Clone the project
- Install the dependencies with ``pnpm install`` in the main directory
- Build and start the project by running ``pnpm exec nx run-many -t serve`` in the main directory
- A electron window should open with the app running
  - you might need to hit Ff (or CMD + R on mac) to refresh the window, this is a timing issue caused by the dev server
