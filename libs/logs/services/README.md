# @service-bus-browser/logs-services

Injectable Logger service for recording messages.

## Running unit tests

Run `nx test @service-bus-browser/logs-services` to execute the unit tests.

## Usage
Inject the `Logger` service and write messages:
```ts
export class DemoComponent {
  constructor(private logger: Logger) {}
  save() {
    this.logger.info('Save clicked');
  }
}
```
