import { SYSTEM_PROPERTIES } from '@service-bus-browser/messages-contracts';
import { SystemPropertyKeys } from '../send-message/form';

export const propertyTypes = [
  { label: 'Text', value: 'string' },
  { label: 'Date', value: 'date' },
  { label: 'Number', value: 'number' },
  { label: 'Boolean', value: 'boolean' },
];

export const stringFilterTypes = [
  { label: 'Contains', value: 'contains' },
  { label: 'Equals', value: 'equals' },
  { label: 'Regex', value: 'regex' },
  { label: 'Not contains', value: 'notcontains' },
  { label: 'Not equals', value: 'notequals' },
  { label: 'Not regex', value: 'notregex' },
];

export const dateFilterTypes = [
  { label: 'Before', value: 'before' },
  { label: 'After', value: 'after' },
  { label: 'Equals', value: 'equals' },
  { label: 'Not equals', value: 'notequals' },
];

export const numberFilterTypes = [
  { label: 'Greater Than', value: 'greater' },
  { label: 'Less Than', value: 'less' },
  { label: 'Equals', value: 'equals' },
  { label: 'Not equals', value: 'notequals' },
];

export const timespanFilterTypes = [
  { label: 'Greater Than', value: 'greater' },
  { label: 'Less Than', value: 'less' },
  { label: 'Equals', value: 'equals' },
  { label: 'Not equals', value: 'notequals' },
];

export const bodyFilterTypes = [
  { label: 'Contains', value: 'contains' },
  { label: 'Regex', value: 'regex' },
  { label: 'Not contains', value: 'notcontains' },
  { label: 'Not regex', value: 'notregex' },
];

export const systemPropertyOptions = Object.entries(SYSTEM_PROPERTIES).map(([key]) => ({
  label: key,
  value: key,
})) as {
  label: string;
  value: SystemPropertyKeys;
}[];
