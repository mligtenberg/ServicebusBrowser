import {
  BodyFilter,
  DateFilter,
  MessageFilter,
  NumberFilter,
  PropertyFilter,
  ServiceBusMessage,
  StringFilter
} from '@service-bus-browser/messages-contracts';

/**
 * Service for filtering messages based on various criteria
 */

export function filterMessages<T extends ServiceBusMessage>(messages: T[], filter: MessageFilter): T[] {
  if (!hasActiveFilters(filter)) {
    return messages;
  }

  let filteredMessages = messages;

  if (hasActiveSystemPropertyFilters(filter)) {
    filteredMessages = filterBySystemProperty(filteredMessages, filter);
  }

  if (hasActiveApplicationPropertyFilters(filter)) {
    filteredMessages = filterByApplicationProperty(filteredMessages, filter);
  }

  if (hasActiveBodyFilter(filter)) {
    filteredMessages = filterByBody(filteredMessages, filter);
  }

  return filteredMessages;
}

export function messageInFilter<T extends ServiceBusMessage>(message: T, filter: MessageFilter): boolean {
  if (!hasActiveFilters(filter)) {
    return true;
  }

  if (hasActiveSystemPropertyFilters(filter)) {
    for (const filterPart of filter.systemProperties) {
      if (!messageInSystemPropertyFilter(message, filterPart)) {
        return false;
      }
    }
  }

  if (hasActiveApplicationPropertyFilters(filter)) {
    for (const filterPart of filter.applicationProperties) {
      if (!messageInApplicationPropertyFilter(message, filterPart)) {
        return false;
      }
    }
  }

  if (hasActiveBodyFilter(filter)) {
    for (const filterPart of filter.body) {
      if (!messageInBodyFilter(message, filterPart)) {
        return false;
      }
    }
  }

  return true;
}

function filterBySystemProperty<T extends ServiceBusMessage>(messages: T[], filter: MessageFilter): T[] {
  let filteredMessages = messages;
  for (const filterPart of filter.systemProperties) {
    filteredMessages = filteredMessages.filter(message => messageInSystemPropertyFilter(message, filterPart));
  }
  return filteredMessages;
}

function messageInSystemPropertyFilter<T extends ServiceBusMessage>(message: T, filter: PropertyFilter): boolean {
  if (!filter.isActive) {
    return true;
  }
  const propValue = message[filter.fieldName as keyof T];
  if (propValue === undefined) {
    return false;
  }
  return matchesPropertyFilter(propValue, filter);
}

function filterByApplicationProperty<T extends ServiceBusMessage>(messages: T[], filter: MessageFilter): T[] {
  let filteredMessages = messages;
  for (const filterPart of filter.applicationProperties) {
    filteredMessages = filteredMessages.filter(message => messageInApplicationPropertyFilter(message, filterPart));
  }
  return filteredMessages;
}

function messageInApplicationPropertyFilter<T extends ServiceBusMessage>(message: T, filter: PropertyFilter): boolean {
  if (!filter.isActive) {
    return true;
  }
  const propValue = message.applicationProperties?.[filter.fieldName];
  if (propValue === undefined) {
    return false;
  }
  return matchesPropertyFilter(propValue, filter);
}

function filterByBody<T extends ServiceBusMessage>(messages: T[], filter: MessageFilter): T[] {
  let filteredMessages = messages;
  for (const filterPart of filter.body) {
    filteredMessages = filteredMessages.filter((message) => messageInBodyFilter(message, filterPart));
  }
  return filteredMessages;
}

function messageInBodyFilter<T extends ServiceBusMessage>(message: T, filter: BodyFilter): boolean {
  if (!filter.isActive) {
    return true;
  }

  if (filter.filterType === 'contains') {
    return message.body.includes(filter.value);
  }

  if (filter.filterType === 'regex') {
    try {
      const regex = new RegExp(filter.value);
      return regex.test(message.body);
    } catch (e) {
      return false;
    }
  }

  if (filter.filterType === 'equals') {
    return message.body === filter.value;
  }

  if (filter.filterType === 'notcontains') {
    return !message.body.includes(filter.value);
  }

  if (filter.filterType === 'notequals') {
    return message.body !== filter.value;
  }

  if (filter.filterType === 'notregex') {
    try {
      const regex = new RegExp(filter.value);
      return !regex.test(message.body);
    } catch (e) {
      return false;
    }
  }

  throw new Error(`Unknown body filter type: ${filter.filterType}`);
}

export function matchesPropertyFilter(value: any, filter: PropertyFilter): boolean {
  switch (filter.fieldType) {
    case 'string':
      return matchesStringFilter(String(value), filter);
    case 'date':
      return matchesDateFilter(value, filter);
    case 'number':
      return matchesNumberFilter(Number(value), filter);
    case 'boolean':
      return value === filter.value;
    default:
      return false;
  }
}

function matchesStringFilter(value: string, filter: StringFilter): boolean {
  switch (filter.filterType) {
    case 'contains':
      return value.includes(filter.value);
    case 'equals':
      return value === filter.value;
    case 'regex':
      try {
        const regex = new RegExp(filter.value);
        return regex.test(value);
      } catch (e) {
        return false;
      }
    case 'notcontains':
      return !value.includes(filter.value);
    case 'notequals':
      return value !== filter.value;
    case 'notregex':
      try {
        const regex = new RegExp(filter.value);
        return !regex.test(value);
      } catch (e) {
        return false;
      }
    default:
      return false;
  }
}

function matchesDateFilter(value: Date | string, filter: DateFilter): boolean {
  const dateValue = value instanceof Date ? value : new Date(value);
  const filterDate = filter.value;

  if (isNaN(dateValue.getTime())) {
    return false;
  }

  switch (filter.filterType) {
    case 'before':
      return dateValue < filterDate;
    case 'after':
      return dateValue > filterDate;
    case 'equals':
      return dateValue.getTime() === filterDate.getTime();
    case 'notequals':
      return dateValue.getTime() !== filterDate.getTime();
    default:
      return false;
  }
}

function matchesNumberFilter(value: number, filter: NumberFilter): boolean {
  if (isNaN(value)) {
    return false;
  }

  switch (filter.filterType) {
    case 'greater':
      return value > filter.value;
    case 'less':
      return value < filter.value;
    case 'equals':
      return value === filter.value;
    case 'notequals':
      return value !== filter.value;
    default:
      return false;
  }
}

export function hasActiveFilters(filter: MessageFilter): boolean {
  return (
    hasActiveSystemPropertyFilters(filter) ||
    hasActiveApplicationPropertyFilters(filter) ||
    hasActiveBodyFilter(filter)
  );
}

export function hasActiveSystemPropertyFilters(filter: MessageFilter): boolean {
  return filter.systemProperties.some(prop => prop.isActive);
}

export function hasActiveApplicationPropertyFilters(filter: MessageFilter): boolean {
  return filter.applicationProperties.some(prop => prop.isActive);
}

export function hasActiveBodyFilter(filter: MessageFilter): boolean {
  return filter.body.some(prop => prop.isActive);
}

export function filterIsValid(filter: MessageFilter): boolean {
  if (filter.systemProperties.filter(prop => !isPropertyFilterValid(prop)).length) {
    return false;
  }

  if (filter.applicationProperties.filter(prop => !isPropertyFilterValid(prop)).length) {
    return false;
  }

  if (filter.body.filter(prop => !isBodyFilterValid(prop)).length) {
    return false;
  }

  return true;
}

function isBodyFilterValid(filter: BodyFilter): boolean {
  if (!filter.filterType) {
    return false;
  }

  if (!filter.value || filter.value === '') {
    return false;
  }

  if (filter.filterType === 'regex') {
    try {
      new RegExp(filter.value);
    } catch {
      return false;
    }
  }

  return true;
}

function isPropertyFilterValid(filter: PropertyFilter): boolean {
  if (!filter.fieldName || filter.fieldName.trim() === '') {
    return false;
  }

  if (filter.fieldType === 'string') {
    return isStringFilterValid(filter);
  }

  if (filter.fieldType === 'date') {
    return isDateFilterValid(filter);
  }

  if (filter.fieldType === 'number') {
    return isNumberFilterValid(filter);
  }

  if (filter.fieldType === 'boolean') {
    return true;
  }

  return false;
}

function isStringFilterValid(filter: StringFilter): boolean {
  if (filter.value === undefined || filter.value === null || filter.value === '') {
    return false;
  }

  if (filter.filterType === 'regex') {
    try {
      new RegExp(filter.value);
    } catch {
      return false;
    }
  }

  return true;
}

function isNumberFilterValid(filter: NumberFilter): boolean {
  if (filter.value === undefined || filter.value === null || isNaN(Number(filter.value))) {
    return false;
  }

  if (!filter.filterType) {
    return false;
  }

  return true;
}

function isDateFilterValid(filter: DateFilter): boolean {
  if (filter.value === undefined || filter.value === null) {
    return false;
  }

  if (!filter.filterType) {
    return false;
  }

  return true;
}
