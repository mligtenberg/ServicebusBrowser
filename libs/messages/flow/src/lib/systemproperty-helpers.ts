import { Injectable } from '@angular/core';
import {
  ReceivedSystemKeyProperty,
  SystemKeyProperty,
} from '@service-bus-browser/messages-contracts';

@Injectable({
  providedIn: 'root',
})
export class SystemPropertyHelpers {
  propertyIsText(propertyName: SystemKeyProperty | ReceivedSystemKeyProperty) {
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

  propertyIsDate(propertyName: SystemKeyProperty | ReceivedSystemKeyProperty) {
    const dateKeys = ['scheduledEnqueueTimeUtc', 'enqueuedTimeUtc'];
    return dateKeys.includes(propertyName);
  }

  propertyIsTimeSpan(
    propertyName: SystemKeyProperty | ReceivedSystemKeyProperty,
  ) {
    const timeSpanKeys = ['timeToLive'];
    return timeSpanKeys.includes(propertyName);
  }
}
