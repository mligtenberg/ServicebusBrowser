import { registerIcon } from './lib/register-function';
import { sbbRabbitMq } from './lib/rabbit-mq-icon';
import { sbbAzureServiceBus } from './lib/service-bus-icon';

export * from './lib/icon-definition';

export {
  sbbRabbitMq,
  sbbAzureServiceBus,
}


export function registerCustomIcons() {
  registerIcon(sbbRabbitMq);
  registerIcon(sbbAzureServiceBus);
}
