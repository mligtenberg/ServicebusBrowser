import { PropertyValue } from '@service-bus-browser/messages-contracts';
import { MessageFilter } from '@service-bus-browser/filtering';

type BaseAction = {
  applyOnFilter: MessageFilter;
};

export type AddPropertiesAction = BaseAction & {
  type: 'add';
  target: 'properties';
  actionOnDuplicate: 'replace' | 'skip';
  fieldName: string;
  value: PropertyValue;
};

export type AddApplicationPropertiesAction = BaseAction & {
  type: 'add';
  target: 'applicationProperties';
  actionOnDuplicate: 'replace' | 'skip';
  fieldName: string;
  value: PropertyValue;
};

export type AddAction = AddPropertiesAction | AddApplicationPropertiesAction;

export type AlterBodyFullReplaceAction = BaseAction & {
  type: 'alter';
  target: 'body';
  value: string;
  alterType: 'fullReplace';
};

export type AlterBodyPartialReplaceAction = BaseAction & {
  type: 'alter';
  target: 'body';
  searchValue: string;
  value: string;
  alterType: 'searchAndReplace' | 'regexReplace';
};

export type AlterBodyAction =
  | AlterBodyFullReplaceAction
  | AlterBodyPartialReplaceAction;

export type AlterPropertyFullReplaceAction = BaseAction & {
  type: 'alter';
  target: 'properties';
  fieldName: string;
  value: PropertyValue;
  alterType: 'fullReplace';
};

export type AlterPropertyPartialReplaceAction = BaseAction & {
  type: 'alter';
  target: 'properties';
  fieldName: string;
  searchValue: string;
  value: string;
  alterType: 'searchAndReplace' | 'regexReplace';
};

export type AlterPropertyActions =
  | AlterPropertyFullReplaceAction
  | AlterPropertyPartialReplaceAction;

export type AlterApplicationPropertyFullReplaceAction = BaseAction & {
  type: 'alter';
  target: 'applicationProperties';
  fieldName: string;
  value: PropertyValue;
  alterType: 'fullReplace';
};

export type AlterApplicationPropertyPartialReplaceAction = BaseAction & {
  type: 'alter';
  target: 'applicationProperties';
  fieldName: string;
  searchValue: string;
  value: string;
  alterType: 'searchAndReplace' | 'regexReplace';
};

export type AlterApplicationPropertyActions =
  | AlterApplicationPropertyFullReplaceAction
  | AlterApplicationPropertyPartialReplaceAction;

export type AlterPropertyAction =
  | AlterPropertyActions
  | AlterApplicationPropertyActions;
export type AlterAction = AlterBodyAction | AlterPropertyAction;
export type AlterType = 'fullReplace' | 'searchAndReplace' | 'regexReplace';

export type RemovePropertyAction = BaseAction & {
  type: 'remove';
  target: 'properties';
  fieldName: string;
};

export type RemoveApplicationPropertyAction = BaseAction & {
  type: 'remove';
  target: 'applicationProperties';
  fieldName: string;
};

export type RemoveAction =
  | RemovePropertyAction
  | RemoveApplicationPropertyAction;

export type BatchActionType = 'add' | 'alter' | 'remove';
export type BatchActionTarget = 'body' | 'properties' | 'applicationProperties';

export type MessageModificationAction = AddAction | AlterAction | RemoveAction;
