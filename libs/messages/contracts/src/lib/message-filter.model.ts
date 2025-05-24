export interface MessageFilterBase {
  fieldName: string;
  fieldType: 'string' | 'date' | 'number' | 'boolean';
  isActive: boolean;
}

export interface StringFilter extends MessageFilterBase {
  fieldType: 'string';
  filterType: 'contains' | 'equals' | 'regex' | 'notequals' | 'notcontains' | 'notregex';
  value: string;
}

export interface DateFilter extends MessageFilterBase {
  fieldType: 'date';
  filterType: 'before' | 'after' | 'equals' | 'notequals';
  value: Date;
}

export interface NumberFilter extends MessageFilterBase {
  fieldType: 'number';
  filterType: 'greater' | 'less' | 'equals'  | 'notequals';
  value: number;
}

export interface BooleanFilter extends MessageFilterBase {
  fieldType: 'boolean';
  filterType: 'equals';
  value: boolean;
}

export type PropertyFilter = StringFilter | DateFilter | NumberFilter | BooleanFilter;

export type BodyFilter = {
  isActive: boolean;
  filterType: 'contains' | 'regex' | 'equals' | 'notcontains' | 'notregex' | 'notequals';
  value: string;
}

export interface MessageFilter {
  systemProperties: PropertyFilter[];
  applicationProperties: PropertyFilter[];
  body: BodyFilter[];
}

// Known system properties with their types
export const SYSTEM_PROPERTIES: { [key: string]: 'string' | 'date' | 'number' | 'boolean' } = {
  messageId: 'string',
  contentType: 'string',
  correlationId: 'string',
  subject: 'string',
  to: 'string',
  timeToLive: 'string',
  enqueuedTimeUtc: 'date',
  sequenceNumber: 'string',
  state: 'string',
  enqueuedSequenceNumber: 'number'
};
