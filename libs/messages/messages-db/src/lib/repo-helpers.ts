import { MessageFilter } from '@service-bus-browser/messages-contracts';

export function isFilterEmpty(filter: MessageFilter) {
  return (
    !filter.body.length &&
    !filter.systemProperties.length &&
    !filter.applicationProperties.length
  );
}
