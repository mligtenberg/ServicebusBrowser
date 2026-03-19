import { Injectable } from '@angular/core';
import {
  MessageModificationAction,
  AddAction,
  AddApplicationPropertiesAction,
  AddPropertiesAction,
  AlterAction,
  AlterApplicationPropertyActions,
  AlterApplicationPropertyFullReplaceAction,
  AlterApplicationPropertyPartialReplaceAction,
  AlterBodyAction,
  AlterBodyFullReplaceAction,
  AlterBodyPartialReplaceAction,
  AlterPropertyActions,
  AlterPropertyFullReplaceAction,
  RemoveAction,
} from './batch-actions.model';
import { messageInFilter } from '@service-bus-browser/filtering';
import { Message } from '@service-bus-browser/api-contracts';

@Injectable({
  providedIn: 'root',
})
export class MessageModificationEngine {
  applyBatchActions<T extends Message>(
    messages: T[],
    actions: MessageModificationAction[],
  ): T[] {
    let modifiedMessages = messages;
    modifiedMessages = modifiedMessages.map((message) =>
      this.applyBatchActionsToMessage(message, actions),
    );

    return modifiedMessages;
  }

  applyBatchActionsToMessage<T extends Message>(
    message: T,
    actions: MessageModificationAction[],
  ): T {
    let modifiedMessage = message;
    for (const action of actions) {
      modifiedMessage = this.applyBatchAction(modifiedMessage, action);
    }
    return modifiedMessage;
  }

  public applyBatchAction<T extends Message>(
    message: T,
    action: MessageModificationAction,
  ): T {
    if (
      action.applyOnFilter &&
      !messageInFilter(message, action.applyOnFilter)
    ) {
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

  private applyAddBatchAction<T extends Message>(
    message: T,
    action: AddAction,
  ): T {
    if (action.target === 'properties') {
      return this.applyAddPropertyBatchAction(message, action);
    }
    if (action.target === 'applicationProperties') {
      return this.applyAddApplicationPropertyBatchAction(message, action);
    }

    throw new Error(`Unknown target ${action}`);
  }

  private applyAddPropertyBatchAction<T extends Message>(
    message: T,
    action: AddPropertiesAction,
  ) {
    const currentValue = (
      message.properties as Record<string, unknown> | undefined
    )?.[action.fieldName];
    if (!currentValue || action.actionOnDuplicate === 'replace') {
      return {
        ...message,
        properties: {
          ...(message.properties ?? {}),
          [action.fieldName]: action.value,
        },
      };
    }

    return message;
  }

  private applyAddApplicationPropertyBatchAction<T extends Message>(
    message: T,
    action: AddApplicationPropertiesAction,
  ): T {
    const currentValue = message.applicationProperties?.[action.fieldName];
    if (!currentValue || action.actionOnDuplicate === 'replace') {
      return {
        ...message,
        applicationProperties: {
          ...(message.applicationProperties ?? {}),
          [action.fieldName]: action.value,
        },
      };
    }

    return message;
  }

  private applyAlterBatchAction<T extends Message>(
    message: T,
    action: AlterAction,
  ): T {
    if (action.target === 'body') {
      return this.applyAlterBodyAction(message, action);
    }
    if (action.target === 'properties') {
      return this.applyAlterPropertyAction(message, action);
    }
    if (action.target === 'applicationProperties') {
      return this.applyAlterApplicationPropertyAction(message, action);
    }

    throw new Error(`Unknown target ${action}`);
  }

  private applyAlterBodyAction<T extends Message>(
    message: T,
    action: AlterBodyAction,
  ): T {
    if (action.alterType === 'fullReplace') {
      return this.applyAlterBodyFullReplaceAction(message, action);
    }
    if (
      action.alterType === 'searchAndReplace' ||
      action.alterType === 'regexReplace'
    ) {
      return this.applyAlterBodyPartialReplaceAction(message, action);
    }

    throw new Error(`Unknown alter body action type ${action}`);
  }

  private applyAlterBodyFullReplaceAction<T extends Message>(
    message: T,
    action: AlterBodyFullReplaceAction,
  ): T {
    return {
      ...message,
      body: new TextEncoder().encode(action.value),
    };
  }

  private applyAlterBodyPartialReplaceAction<T extends Message>(
    message: T,
    action: AlterBodyPartialReplaceAction,
  ): T {
    const value = new TextDecoder().decode(message.body);
    if (action.alterType === 'searchAndReplace') {
      return {
        ...message,
        body: new TextEncoder().encode(
          this.searchAndReplace(value, action.searchValue, action.value),
        ),
      };
    }
    if (action.alterType === 'regexReplace') {
      return {
        ...message,
        body: new TextEncoder().encode(
          this.replaceByRegex(value, action.searchValue, action.value),
        ),
      };
    }

    throw new Error(`Unknown alter body action type ${action}`);
  }

  private applyAlterPropertyAction<T extends Message>(
    message: T,
    action: AlterPropertyActions,
  ): T {
    if (action.alterType === 'fullReplace') {
      return this.applyAlterPropertyFullReplaceAction(message, action);
    }
    if (
      action.alterType === 'searchAndReplace' ||
      action.alterType === 'regexReplace'
    ) {
      return this.applyAlterPropertyPartialReplaceAction(message, action);
    }

    throw new Error(`Unknown alter property action type ${action}`);
  }

  private applyAlterPropertyFullReplaceAction<T extends Message>(
    message: T,
    action: AlterPropertyFullReplaceAction,
  ): T {
    const currentValue = (
      message.properties as Record<string, unknown> | undefined
    )?.[action.fieldName];
    return currentValue
      ? {
          ...message,
          properties: {
            ...(message.properties ?? {}),
            [action.fieldName]: action.value,
          },
        }
      : message;
  }

  private applyAlterPropertyPartialReplaceAction<T extends Message>(
    message: T,
    action: AlterPropertyActions,
  ): T {
    const value = (message.properties as Record<string, unknown> | undefined)?.[
      action.fieldName
    ];
    if (!value || typeof value !== 'string') {
      return message;
    }

    if (action.alterType === 'searchAndReplace') {
      return {
        ...message,
        properties: {
          ...(message.properties ?? {}),
          [action.fieldName]: this.searchAndReplace(
            value,
            action.searchValue,
            action.value,
          ),
        },
      };
    }
    if (action.alterType === 'regexReplace') {
      return {
        ...message,
        properties: {
          ...(message.properties ?? {}),
          [action.fieldName]: this.replaceByRegex(
            value,
            action.searchValue,
            action.value,
          ),
        },
      };
    }

    throw new Error(`Unknown alter system property action type ${action}`);
  }

  private applyAlterApplicationPropertyAction<T extends Message>(
    message: T,
    action: AlterApplicationPropertyActions,
  ): T {
    if (action.alterType === 'fullReplace') {
      return this.applyAlterApplicationPropertyFullReplaceAction(
        message,
        action,
      );
    }
    if (
      action.alterType === 'searchAndReplace' ||
      action.alterType === 'regexReplace'
    ) {
      return this.applyAlterApplicationPropertyPartialReplaceAction(
        message,
        action,
      );
    }

    throw new Error(`Unknown alter application property action type ${action}`);
  }

  private applyAlterApplicationPropertyFullReplaceAction<T extends Message>(
    message: T,
    action: AlterApplicationPropertyFullReplaceAction,
  ): T {
    const currentValue = message.applicationProperties?.[action.fieldName];
    return currentValue
      ? {
          ...message,
          applicationProperties: {
            ...(message.applicationProperties ?? {}),
            [action.fieldName]: action.value,
          },
        }
      : message;
  }

  private applyAlterApplicationPropertyPartialReplaceAction<T extends Message>(
    message: T,
    action: AlterApplicationPropertyPartialReplaceAction,
  ): T {
    const value = message.applicationProperties?.[action.fieldName];
    if (!value || typeof value !== 'string') {
      return message;
    }

    if (action.alterType === 'searchAndReplace') {
      return {
        ...message,
        applicationProperties: {
          ...(message.applicationProperties ?? {}),
          [action.fieldName]: this.searchAndReplace(
            value,
            action.searchValue,
            action.value,
          ),
        },
      };
    }
    if (action.alterType === 'regexReplace') {
      return {
        ...message,
        applicationProperties: {
          ...(message.applicationProperties ?? {}),
          [action.fieldName]: this.replaceByRegex(
            value,
            action.searchValue,
            action.value,
          ),
        },
      };
    }

    throw new Error(`Unknown alter application property action type ${action}`);
  }

  private applyRemoveBatchAction<T extends Message>(
    message: T,
    action: RemoveAction,
  ): T {
    if (action.target === 'properties') {
      const updatedProps = {
        ...(message.properties ?? {}),
      } as Record<string, unknown>;
      delete updatedProps[action.fieldName];
      return {
        ...message,
        properties: updatedProps,
      };
    }
    if (action.target === 'applicationProperties') {
      return {
        ...message,
        applicationProperties: {
          ...message.applicationProperties,
          [action.fieldName]: undefined,
        },
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
