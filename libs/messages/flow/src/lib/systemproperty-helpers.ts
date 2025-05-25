import { Injectable } from '@angular/core';
import { SystemKeyProperty } from '@service-bus-browser/messages-contracts';

@Injectable({
  providedIn: 'root'
})
export class SystemPropertyHelpers {
  propertyIsText(propertyName: SystemKeyProperty) {
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

  propertyIsDate(propertyName: SystemKeyProperty) {
    const dateKeys = ['scheduledEnqueueTimeUtc'];
    return dateKeys.includes(propertyName);
  }

  propertyIsTimeSpan(propertyName: SystemKeyProperty) {
    const timeSpanKeys = ['timeToLive'];
    return timeSpanKeys.includes(propertyName);
  }
}
