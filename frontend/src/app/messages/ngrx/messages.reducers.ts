import {createReducer, on} from '@ngrx/store';
import {IMessageSet, MessageOrigin, MessagesChannel} from './messages.models';
import * as actions from './messages.actions';

export interface IMessagesState {
  messageSets: IMessageSet[];
}

const initialState: IMessagesState = {
  messageSets: []
};

export const messagesReducer = createReducer<IMessagesState>(
  initialState,
  on(actions.getQueueMessagesSuccess, (state, action) => {
    let name = '';
    if (action.channel === MessagesChannel.deadletter) {
      name += '[DL] ';
    }

    if (action.channel === MessagesChannel.transferedDeadletters) {
      name += '[TDL] ';
    }

    name += `${action.queueName} `;

    const sequenceNumbers = action.messages.map(m => m.properties.sequenceNumber.toNumber());
    if (sequenceNumbers.length) {
      const minSequenceNumber = Math.min(...sequenceNumbers);
      const maxSequenceNumber = Math.max(...sequenceNumbers);
      name += `(${minSequenceNumber} - ${maxSequenceNumber})`;
    } else {
      name += '(0 results)';
    }

    return {
      ...state,
      messageSets: [
        ...state.messageSets,
        {
          messageSetId: action.messageSetId,
          name,
          connectionId: action.connectionId,
          origin: MessageOrigin.Queue,
          queueName: action.queueName,
          messages: action.messages
        }]
    };
  }),
  on(actions.getSubscriptionMessagesSuccess, (state, action) => {
    let name = `${action.subscriptionName}/${action.topicName} `;

    const sequenceNumbers = action.messages.map(m => m.properties.sequenceNumber.toNumber());
    if (sequenceNumbers.length) {
      const minSequenceNumber = Math.min(...sequenceNumbers);
      const maxSequenceNumber = Math.max(...sequenceNumbers);
      name += `(${minSequenceNumber} - ${maxSequenceNumber})`;
    } else {
      name += '(0 results)';
    }

    return {
      ...state,
      messageSets: [
        ...state.messageSets,
        {
          messageSetId: action.messageSetId,
          connectionId: action.connectionId,
          name,
          origin: MessageOrigin.Subscription,
          topicName: action.topicName,
          subscriptionName: action.subscriptionName,
          messages: action.messages
        }]
    };
  }),
  on(actions.getQueueMessages, actions.getSubscriptionMessages, (state) => {
    return {
      ...state,
      openedMessages: null
    };
  })
);
