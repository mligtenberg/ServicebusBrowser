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

  toFilterPropertyType(propertyName: SystemPropertyKey | ReceivedSystemPropertyKey): 'date' | 'timespan' | 'string' {
    if (this.propertyIsDate(propertyName)) {
      return 'date';
    }
    if (this.propertyIsTimeSpan(propertyName)) {
      return 'timespan';
    }

    return 'string';
  }
}
