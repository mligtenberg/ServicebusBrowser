import { registerIcon } from './lib/register-function';
import { sbbRabbitMq } from './lib/rabbit-mq-icon';
import { sbbAzureServiceBus } from './lib/service-bus-icon';
import { sbbAzureEventHub } from './lib/event-hub-icon';

export * from './lib/icon-definition';

export {
  sbbRabbitMq,
  sbbAzureServiceBus,
  sbbAzureEventHub,
}


export function registerCustomIcons() {
  registerIcon(sbbRabbitMq);
  registerIcon(sbbAzureServiceBus);
  registerIcon(sbbAzureEventHub);
}
