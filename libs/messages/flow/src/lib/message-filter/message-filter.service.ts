import { Injectable } from '@angular/core';
import {
  BodyFilter,
  DateFilter,
  MessageFilter,
  NumberFilter,
  PropertyFilter,
  ServiceBusReceivedMessage,
  StringFilter
} from '@service-bus-browser/messages-contracts';

/**
 * Service for filtering messages based on various criteria
 */
@Injectable()
export class MessageFilterService {
  /**
   * Filters messages based on the provided filter criteria
   * @param messages The messages to filter
   * @param filter The filter criteria to apply
   * @returns Filtered messages that match the criteria
   */
  filterMessages(messages: ServiceBusReceivedMessage[], filter: MessageFilter): ServiceBusReceivedMessage[] {
    // If no active filters, return all messages
    if (!this.hasActiveFilters(filter)) {
      return messages;
    }

    let filteredMessages = messages;

    if (this.hasActiveSystemPropertyFilters(filter)) {
      filteredMessages = this.filterBySystemProperty(filteredMessages, filter);
    }

    if (this.hasActiveApplicationPropertyFilters(filter)) {
      filteredMessages = this.filterByApplicationProperty(filteredMessages, filter);
    }

    if (this.hasActiveBodyFilter(filter)) {
      filteredMessages = this.filterByBody(filteredMessages, filter);
    }

    return filteredMessages;
  }

  /**
   * Checks if the provided filter is valid, by checking if all required fields are present
   *
   * @param filter The filter to check
   * @returns True if the filter is valid, false otherwise
   */
  filterIsValid(filter: MessageFilter): boolean {
    if (filter.systemProperties.filter(prop => !this.isPropertyFilterValid(prop)).length) {
      return false;
    }

    if (filter.applicationProperties.filter(prop => !this.isPropertyFilterValid(prop)).length) {
      return false;
    }

    if (filter.body.filter(prop => !this.isBodyFilterValid(prop)).length) {
      return false;
    }

    return true;
  }

  private isBodyFilterValid(filter: BodyFilter): boolean {
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

  private isPropertyFilterValid(filter: PropertyFilter): boolean {
    // Check if field name is set
    if (!filter.fieldName || filter.fieldName.trim() === '') {
      return false;
    }

    if (filter.fieldType === 'string') {
      return this.isStringFilterValid(filter);
    }

    if (filter.fieldType === 'date') {
      return this.isDateFilterValid(filter);
    }

    if (filter.fieldType === 'number') {
      return this.isNumberFilterValid(filter);
    }

    if (filter.fieldType === 'boolean') {
      return true;
    }

    return false;
  }

  private isStringFilterValid(filter: StringFilter): boolean {
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

  private isNumberFilterValid(filter: NumberFilter): boolean {
    if (filter.value === undefined || filter.value === null || isNaN(Number(filter.value))) {
      return false;
    }

    if (!filter.filterType) {
      return false;
    }

    return true;
  }

  private isDateFilterValid(filter: DateFilter): boolean {
    if (filter.value === undefined || filter.value === null) {
      return false;
    }

    if (!filter.filterType) {
      return false;
    }

    return true;
  }

  private filterBySystemProperty(messages: ServiceBusReceivedMessage[], filter: MessageFilter): ServiceBusReceivedMessage[] {
    let filteredMessages = messages;
    for (const filterPart of filter.systemProperties) {
      filteredMessages = filteredMessages.filter(message => {
        const propValue = message[filterPart.fieldName as keyof ServiceBusReceivedMessage];
        if (propValue === undefined) {
          return false;
        }

        return this.matchesPropertyFilter(propValue, filterPart);
      })
    }

    return filteredMessages;
  }

  private filterByApplicationProperty(messages: ServiceBusReceivedMessage[], filter: MessageFilter): ServiceBusReceivedMessage[] {
    let filteredMessages = messages;
    for (const filterPart of filter.applicationProperties) {
      filteredMessages = filteredMessages.filter(message => {
        const propValue = message.applicationProperties?.[filterPart.fieldName];
        if (propValue === undefined) {
          return false;
        }

        return this.matchesPropertyFilter(propValue, filterPart);
      })
    }

    return filteredMessages;
  }

  private filterByBody(messages: ServiceBusReceivedMessage[], filter: MessageFilter): ServiceBusReceivedMessage[] {
    let filteredMessages = messages;
    for (const filterPart of filter.body) {
      filteredMessages = messages.filter(message => {
        if (filterPart.filterType === 'contains') {
          return message.body.includes(filterPart.value);
        }

        if (filterPart.filterType === 'regex') {
          try {
            const regex = new RegExp(filterPart.value);
            return regex.test(message.body);
          } catch (e) {
            return false;
          }
        }

        if (filterPart.filterType === 'equals') {
          return message.body === filterPart.value;
        }
      })
    }

    return filteredMessages;
  }
  /**
   * Checks if there are any active filters
   *
   * @param filter The filter to check
   * @returns True if there are active filters, false otherwise
   */
  hasActiveFilters(filter: MessageFilter): boolean {
    return (
      this.hasActiveSystemPropertyFilters(filter) ||
      this.hasActiveApplicationPropertyFilters(filter) ||
      this.hasActiveBodyFilter(filter)
    );
  }

  /**
   * Checks if the given filter has any active system property filters.
   *
   * @param {MessageFilter} filter - The filter object containing system properties to evaluate.
   * @return {boolean} Returns true if there is at least one active system property filter; otherwise, false.
   */
  hasActiveSystemPropertyFilters(filter: MessageFilter): boolean {
    return filter.systemProperties.some(prop => prop.isActive);
  }

  /**
   * Checks if there are active application property filters in the provided filter object.
   *
   * @param {MessageFilter} filter - The filter object containing application properties to check.
   * @return {boolean} Returns true if there are any active application property filters, otherwise false.
   */
  hasActiveApplicationPropertyFilters(filter: MessageFilter): boolean {
    return filter.applicationProperties.some(prop => prop.isActive);
  }

  /**
   * Determines whether the provided filter contains an active body filter.
   *
   * @param {MessageFilter} filter - The filter object to check, which contains a body property.
   * @return {boolean} Returns true if the filter has at least one active body filter, otherwise false.
   */
  hasActiveBodyFilter(filter: MessageFilter): boolean {
    return filter.body.some(prop => prop.isActive);
  }

  /**
   * Checks if a property value matches the specified filter
   * @param value The property value to check
   * @param filter The filter to apply
   * @returns True if the value matches the filter, false otherwise
   */
  matchesPropertyFilter(value: any, filter: PropertyFilter): boolean {
    switch (filter.fieldType) {
      case 'string':
        return this.matchesStringFilter(String(value), filter);
      case 'date':
        return this.matchesDateFilter(value, filter);
      case 'number':
        return this.matchesNumberFilter(Number(value), filter);
      case 'boolean':
        return value === filter.value;
      default:
        return false;
    }
  }

  /**
   * Checks if a string value matches the specified string filter
   * @param value The string value to check
   * @param filter The string filter to apply
   * @returns True if the value matches the filter, false otherwise
   */
  private matchesStringFilter(value: string, filter: StringFilter): boolean {
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
      default:
        return false;
    }
  }

  /**
   * Checks if a date value matches the specified date filter
   * @param value The date value to check
   * @param filter The date filter to apply
   * @returns True if the value matches the filter, false otherwise
   */
  private matchesDateFilter(value: Date | string, filter: DateFilter): boolean {
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
      default:
        return false;
    }
  }

  /**
   * Checks if a number value matches the specified number filter
   * @param value The number value to check
   * @param filter The number filter to apply
   * @returns True if the value matches the filter, false otherwise
   */
  private matchesNumberFilter(value: number, filter: NumberFilter): boolean {
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
      default:
        return false;
    }
  }
}
