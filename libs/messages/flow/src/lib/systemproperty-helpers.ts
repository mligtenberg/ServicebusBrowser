import { Injectable } from '@angular/core';
import {
  ReceivedSystemPropertyKey,
  SystemPropertyKey,
} from '@service-bus-browser/messages-contracts';

@Injectable({
  providedIn: 'root',
})
export class SystemPropertyHelpers {
  propertyIsText(propertyName: SystemPropertyKey | ReceivedSystemPropertyKey) {
    const stringKeys = [
      'correlationId',
      'partitionKey',
      'sessionId',
      'replyToSessionId',
      'messageId',
      'subject',
      'to',
      'replyTo',
    ];
    return stringKeys.includes(propertyName);
  }

  propertyIsDate(propertyName: SystemPropertyKey | ReceivedSystemPropertyKey) {
    const dateKeys = ['scheduledEnqueueTimeUtc', 'enqueuedTimeUtc'];
    return dateKeys.includes(propertyName);
  }

  propertyIsTimeSpan(
    propertyName: SystemPropertyKey | ReceivedSystemPropertyKey,
  ) {
    const timeSpanKeys = ['timeToLive'];
    return timeSpanKeys.includes(propertyName);
  }

  propertyIsNumber(propertyName: SystemPropertyKey | ReceivedSystemPropertyKey) {
    const numberKeys = ['deliveryCount', 'enqueuedSequenceNumber', 'sequenceNumber'];
    return numberKeys.includes(propertyName);
  }

  toFilterPropertyType(propertyName: SystemPropertyKey | ReceivedSystemPropertyKey): 'date' | 'timespan' | 'string' | 'number' {
    if (this.propertyIsDate(propertyName)) {
      return 'date';
    }
    if (this.propertyIsTimeSpan(propertyName)) {
      return 'timespan';
    }

    if (this.propertyIsNumber(propertyName)) {
      return 'number';
    }

    return 'string';
  }
}
