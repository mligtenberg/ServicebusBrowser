import { PropertyValue, SystemKeyProperty } from './messages-contracts';
import { MessageFilter } from './message-filter.model';

export type BatchActionType = 'add' | 'alter' | 'remove';
export type BatchActionTarget = 'body' | 'systemProperties' | 'applicationProperties';

type BaseAction = {
  applyOnFilter: MessageFilter;
}

export type AddSystemPropertiesAction = BaseAction & {
  type: 'add';
  target: 'systemProperties';
  actionOnDuplicate: 'replace' | 'skip';
  fieldName: SystemKeyProperty;
  value: PropertyValue;
}

export type AddApplicationPropertiesAction = BaseAction & {
  type: 'add';
  target:  'applicationProperties';
  actionOnDuplicate: 'replace' | 'skip';
  fieldName: string;
  value: PropertyValue;
}

export type AddAction = AddSystemPropertiesAction | AddApplicationPropertiesAction;

export type AlterBodyFullReplaceAction = BaseAction & {
  type: 'alter';
  target: 'body';
  value: string;
  alterType: 'fullReplace';
}

export type AlterBodyPartialReplaceAction = BaseAction & {
  type: 'alter';
  target: 'body';
  searchValue: string;
  value: string;
  alterType: 'searchAndReplace' | 'regexReplace';
}

export type AlterBodyAction = AlterBodyFullReplaceAction | AlterBodyPartialReplaceAction;

export type AlterSystemPropertyFullReplaceAction = BaseAction & {
  type: 'alter';
  target: 'systemProperties';
  fieldName: SystemKeyProperty;
  value: PropertyValue;
  alterType: 'fullReplace';
}

export type AlterSystemPropertyPartialReplaceAction = BaseAction & {
  type: 'alter';
  target: 'systemProperties';
  fieldName: SystemKeyProperty;
  searchValue: string;
  value: string;
  alterType: 'searchAndReplace' | 'regexReplace';
}

export type AlterSystemPropertyActions = AlterSystemPropertyFullReplaceAction | AlterSystemPropertyPartialReplaceAction;

export type AlterApplicationPropertyFullReplaceAction = BaseAction & {
  type: 'alter';
  target: 'applicationProperties';
  fieldName: string;
  value: PropertyValue;
  alterType: 'fullReplace';
}

export type AlterApplicationPropertyPartialReplaceAction = BaseAction & {
  type: 'alter';
  target: 'applicationProperties';
  fieldName: string;
  searchValue: string;
  value: string;
  alterType: 'searchAndReplace' | 'regexReplace';
}

export type AlterApplicationPropertyActions = AlterApplicationPropertyFullReplaceAction | AlterApplicationPropertyPartialReplaceAction;

export type AlterPropertyAction = AlterSystemPropertyActions | AlterApplicationPropertyActions;
export type AlterAction = AlterBodyAction | AlterPropertyAction;
export type AlterType = 'fullReplace' | 'searchAndReplace' | 'regexReplace';

export type RemoveSystemPropertyAction = BaseAction & {
  type: 'remove';
  target: 'systemProperties';
  fieldName: SystemKeyProperty;
}

export type RemoveApplicationPropertyAction = BaseAction & {
  type: 'remove';
  target: 'applicationProperties';
  fieldName: string;
}

export type RemoveAction = RemoveSystemPropertyAction | RemoveApplicationPropertyAction;

export type Action = AddAction | AlterAction | RemoveAction;
