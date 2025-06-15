# Libraries

The workspace is organized into a set of reusable libraries under `libs/`. Each
folder groups functionality that can be imported by the applications and other
libraries.

## Library groups

| Folder | Purpose |
| ------ | ------- |
| `connections` | Manage persisted Service Bus connections and related NgRx flow. |
| `logs` | Logging contracts, store, UI components and the injectable `Logger`. |
| `messages` | Message contracts and NgRx store for retrieving and sending messages. |
| `service-bus` | Wrappers around the Azure Service Bus SDK and Angular providers. |
| `shared` | Common components, helper services and shared TypeScript types. |
| `tasks` | Store and components that track background operations. |
| `topology` | Manage namespaces, queues, topics and related UI components. |

Libraries are referenced using their package names, e.g.
`@service-bus-browser/logs-store`.
