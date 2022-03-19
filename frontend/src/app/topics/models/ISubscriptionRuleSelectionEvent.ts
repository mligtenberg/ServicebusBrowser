import { ISubscription, ITopic } from '../ngrx/topics.models';
import {RuleProperties} from '@azure/service-bus';

export interface ISubscriptionRuleSelectionEvent {
  type: SubscriptionRuleSelectionType;
  clickPosition: {
    clientX: number,
    clientY: number
  };
  topic: ITopic;
  subscription: ISubscription;
  rule: RuleProperties;
}

export enum SubscriptionRuleSelectionType {
  click,
  contextMenu
}
