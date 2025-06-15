<div>
    <br>
    <picture id="theme-default">
        <source srcset="assets/logo-text-dark.png" media="(prefers-color-scheme: dark)" />
        <source srcset="assets/logo-text.png" media="(prefers-color-scheme: light)" />
        <img src="assets/logo-text-dark.png" />
    </picture>
    <br>
</div>

# Servicebus Browser

A modern, cross-platform desktop tool for managing Azure Service Bus resources. Built with Angular, Electron, and Nx, Servicebus Browser provides a powerful UI for developers and administrators to efficiently manage queues, topics, subscriptions, and messages.

<img width="1512" alt="image" src="https://github.com/user-attachments/assets/95383425-7698-4c69-a949-8ab09e3548dd" />

## Features

- **Comprehensive Azure Service Bus Management**
  - View, create, edit, and delete namespaces, queues, topics, subscriptions, and subscription rules
  - Manage queue/topic properties, settings, and metadata
  - Advanced subscription and rule management with filtering and batch actions
- **Message Operations**
  - Peek (read without removing) messages from queues and subscriptions, including main, deadletter, and transfer deadletter channels
  - Clear messages from any channel (main, deadletter, transfer deadletter) in bulk
  - Batch send, export, and import messages
  - Advanced message filtering (system/application/body properties, negative filters, etc.)
  - Edit message properties and perform bulk actions
- **Bulk and Automation Tools**
  - Batch sending pipeline for high-throughput scenarios
  - Import/export action lists for repeatable operations
  - Task tracking and progress UI for long-running operations
- **User Experience**
  - Modern, responsive UI with dark, light, and system theme support
  - Context menus and quick actions for all resource types
  - Logs panel for real-time feedback and troubleshooting
  - Multi-tab interface for working with multiple resources simultaneously
- **Cross-Platform**
  - Native installers for Windows, Linux, and macOS
  - Manual build and development environment support

## Installation

### Download Installer
- Get the latest Windows, Linux, or macOS installer from the [Releases page](https://github.com/mligtenberg/ServicebusBrowser/releases)

### Manual Build (Release)
**Requirements:**
- Node.js v22
- PNPM v9

**Steps:**
1. Clone the repository
2. Install dependencies:
   ```sh
   pnpm install
   ```
3. Build the application:
   ```sh
   pnpm exec nx run-many -t build make
   ```

### Manual Build (Development)
1. Clone the repository
2. Install dependencies:
   ```sh
   pnpm install
   ```
3. Start the development environment:
   ```sh
   pnpm exec nx run-many -t serve
   ```
4. An Electron window will open. If the UI does not load immediately, refresh with `F5` (or `Cmd+R` on macOS).

## Usage Highlights

- **Resource Management:** Right-click on any resource in the sidebar to access context menus for quick actions (add, edit, remove, clear, etc.)
- **Message Filtering:** Use the filter dialog to create complex filters on system, application, or body properties
- **Batch Operations:** Select multiple messages or resources for bulk actions (clear, export, resend, etc.)
- **Logs & Tasks:** Monitor ongoing operations and view logs in the dedicated panels
- **Theme:** Change between dark, light, or system themes from the settings menu

## Library Overview

The source code is split into reusable libraries located in the [`libs`](libs/README.md) folder. Each
library focuses on a single concern such as logging, tasks or the Service Bus clients.
Refer to [`libs/README.md`](libs/README.md) for a description of all libraries.

## Contributing

This project uses Nx for monorepo management. Contributions are welcome! Please open issues or pull requests for bug fixes, features, or documentation improvements.

## License

[MIT](LICENSE)
