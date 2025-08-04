import { inject, Injectable } from '@angular/core';
import {
  Action,
  AddAction,
  AddApplicationPropertiesAction,
  AddSystemPropertiesAction,
  AlterAction,
  AlterApplicationPropertyActions,
  AlterApplicationPropertyFullReplaceAction,
  AlterApplicationPropertyPartialReplaceAction, AlterBodyAction,
  AlterBodyFullReplaceAction,
  AlterBodyPartialReplaceAction,
  AlterSystemPropertyActions,
  AlterSystemPropertyFullReplaceAction,
  RemoveAction,
  ServiceBusMessage
} from '@service-bus-browser/messages-contracts';
import { messageInFilter } from '@service-bus-browser/filtering';

@Injectable()
export class BatchActionsService {
  applyBatchActions<T extends ServiceBusMessage>(messages: T[], actions: Action[]): T[] {
    let modifiedMessages = messages;
    modifiedMessages = modifiedMessages.map(message => this.applyBatchActionsToMessage(message, actions));

    return modifiedMessages;
  }

  applyBatchActionsToMessage<T extends ServiceBusMessage>(message: T, actions: Action[]): T {
    let modifiedMessage = message;
    for (const action of actions) {
      modifiedMessage = this.applyBatchAction(modifiedMessage, action);
    }
    return modifiedMessage;
  }


  public applyBatchAction<T extends ServiceBusMessage>(message: T, action: Action) {
    if (action.applyOnFilter && !messageInFilter(message, action.applyOnFilter)) {
      return message;
    }

    if (action.type === 'add') {
      return this.applyAddBatchAction(message, action);
    }

    if (action.type === 'alter') {
      return this.applyAlterBatchAction(message, action);
    }

    if (action.type === 'remove') {
      return this.applyRemoveBatchAction(message, action);
    }

    throw new Error(`Unknown action type ${action}`);
  }

  private applyAddBatchAction<T extends ServiceBusMessage>(message: T, action: AddAction) {
    if (action.target === 'systemProperties') {
      return this.applyAddSystemPropertyBatchAction(message, action);
    }
    if (action.target === 'applicationProperties') {
      return this.applyAddApplicationPropertyBatchAction(message, action);
    }

    throw new Error(`Unknown target ${action}`);
  }

  private applyAddSystemPropertyBatchAction<T extends ServiceBusMessage>(message: T, action: AddSystemPropertiesAction) {
    const currentValue = message[action.fieldName];
    if (!currentValue || action.actionOnDuplicate === 'replace') {
      return {
        ...message,
        [action.fieldName]: action.value
      }
    }

    return message;
  }

  private applyAddApplicationPropertyBatchAction<T extends ServiceBusMessage>(message: T, action: AddApplicationPropertiesAction) {
      const currentValue = message.applicationProperties?.[action.fieldName];
      if (!currentValue || action.actionOnDuplicate === 'replace') {
        return {
          ...message,
          applicationProperties: {
            ...message.applicationProperties ?? {},
            [action.fieldName]: action.value,
          }
        }
      }

      return message;
  }

  private applyAlterBatchAction<T extends ServiceBusMessage>(message: T, action: AlterAction) {
    if (action.target === 'body') {
      return this.applyAlterBodyAction(message, action);
    }
    if (action.target === 'systemProperties') {
      return this.applyAlterSystemPropertyAction(message, action);
    }
    if (action.target === 'applicationProperties') {
      return this.applyAlterApplicationPropertyAction(message, action);
    }

    throw new Error(`Unknown target ${action}`);
  }

  private applyAlterBodyAction<T extends ServiceBusMessage>(message: T, action: AlterBodyAction) {
    if (action.alterType === 'fullReplace') {
      return this.applyAlterBodyFullReplaceAction(message, action);
    }
    if (action.alterType === 'searchAndReplace' || action.alterType === 'regexReplace') {
      return this.applyAlterBodyPartialReplaceAction(message, action);
    }

    throw new Error(`Unknown alter body action type ${action}`);
  }

  private applyAlterBodyFullReplaceAction<T extends ServiceBusMessage>(message: T, action: AlterBodyFullReplaceAction) {
      return {
          ...message,
          body: action.value
        }
  }

  private applyAlterBodyPartialReplaceAction<T extends ServiceBusMessage>(message: T, action: AlterBodyPartialReplaceAction) {
      const value = message.body;
      if (action.alterType === 'searchAndReplace') {
        return {
          ...message,
          body: this.searchAndReplace(value, action.searchValue, action.value)
        }
      }
      if (action.alterType === 'regexReplace') {
        return {
          ...message,
          body: this.replaceByRegex(value, action.searchValue, action.value)
        }
      }

      throw new Error(`Unknown alter body action type ${action}`);
  }

  private applyAlterSystemPropertyAction<T extends ServiceBusMessage>(message: T, action: AlterSystemPropertyActions) {
    if (action.alterType === 'fullReplace') {
      return this.applyAlterSystemPropertyFullReplaceAction(message, action);
    }
    if (action.alterType === 'searchAndReplace' || action.alterType === 'regexReplace') {
      return this.applyAlterSystemPropertyPartialReplaceAction(message, action);
    }

    throw new Error(`Unknown alter system property action type ${action}`);
  }

  private applyAlterSystemPropertyFullReplaceAction<T extends ServiceBusMessage>(message: T, action: AlterSystemPropertyFullReplaceAction) {
      const currentValue = message[action.fieldName];
      return currentValue ? {
          ...message,
          [action.fieldName]: action.value
        } : message;
  }

  private applyAlterSystemPropertyPartialReplaceAction<T extends ServiceBusMessage>(message: T, action: AlterSystemPropertyActions) {
      const value = message[action.fieldName];
      if (!value || typeof value !== 'string') {
        return message;
      }

      if (action.alterType === 'searchAndReplace') {
        return {
          ...message,
          [action.fieldName]: this.searchAndReplace(value, action.searchValue, action.value)
        }
      }
      if (action.alterType === 'regexReplace') {
        return {
          ...message,
          [action.fieldName]: this.replaceByRegex(value, action.searchValue, action.value)
        }
      }

      throw new Error(`Unknown alter system property action type ${action}`);
  }

  private applyAlterApplicationPropertyAction<T extends ServiceBusMessage>(message: T, action: AlterApplicationPropertyActions) {
    if (action.alterType === 'fullReplace') {
      return this.applyAlterApplicationPropertyFullReplaceAction(message, action);
    }
    if (action.alterType === 'searchAndReplace' || action.alterType === 'regexReplace') {
      return this.applyAlterApplicationPropertyPartialReplaceAction(message, action);
    }

    throw new Error(`Unknown alter application property action type ${action}`);
  }

  private applyAlterApplicationPropertyFullReplaceAction<T extends ServiceBusMessage>(message: T, action: AlterApplicationPropertyFullReplaceAction) {
      const currentValue = message.applicationProperties?.[action.fieldName];
      return currentValue ? {
          ...message,
          applicationProperties: {
            ...message.applicationProperties ?? {},
            [action.fieldName]: action.value,
          }
      } : message;
  }

  private applyAlterApplicationPropertyPartialReplaceAction<T extends ServiceBusMessage>(message: T, action: AlterApplicationPropertyPartialReplaceAction) {
      const value = message.applicationProperties?.[action.fieldName];
      if (!value || typeof value !== 'string') {
        return message;
      }

      if (action.alterType === 'searchAndReplace') {
        return {
          ...message,
          applicationProperties: {
            ...message.applicationProperties ?? {},
            [action.fieldName]: this.searchAndReplace(value, action.searchValue, action.value)
          }
        }
      }
      if (action.alterType === 'regexReplace') {
        return {
          ...message,
          applicationProperties: {
            ...message.applicationProperties ?? {},
            [action.fieldName]: this.replaceByRegex(value, action.searchValue, action.value)
          }
        }
      }

      throw new Error(`Unknown alter application property action type ${action}`);
  }

  private applyRemoveBatchAction<T extends ServiceBusMessage>(message: T, action: RemoveAction) {
    if (action.target === 'systemProperties') {
      return {
        ...message,
        [action.fieldName]: undefined
      };
    }
    if (action.target === 'applicationProperties') {
      return {
        ...message,
        applicationProperties: {
          ...message.applicationProperties,
          [action.fieldName]: undefined,
        }
      };
    }

    throw new Error(`Unknown target ${action}`);
  }

  private replaceByRegex(value: string, regex: string, replacement: string) {
    return (value as any).replaceAll(new RegExp(regex, 'g'), replacement);
  }

  private searchAndReplace(value: string, search: string, replacement: string) {
    return value.replace(search, replacement);
  }
}
