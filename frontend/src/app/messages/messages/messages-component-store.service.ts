import { Injectable } from '@angular/core';
import { IMessageSet, IMessageTableRow } from '../ngrx/messages.models';
import { ComponentStore } from '@ngrx/component-store';
import { Store } from '@ngrx/store';
import { State } from '../../ngrx.module';
import { Observable, switchMap } from 'rxjs';
import { map, tap, withLatestFrom } from 'rxjs/operators';
import { getMessages } from '../ngrx/messages.selectors';
import { sendMessages } from '../ngrx/messages.actions';
import { v4 as uuidv4 } from 'uuid';

interface IMessageSetState {
    messageSet?: IMessageSet;
    selectedMessageId?: string;
}

@Injectable()
export class MessagesComponentStoreService extends ComponentStore<IMessageSetState> {
    // selectors
    readonly messageSet$ = this.select((state) => state.messageSet);
    readonly currentMessage$ = this.select((state) => {
        return state.messageSet?.messages.find((m) => m.id === state.selectedMessageId);
    });

    readonly messagesTableRows$ = this.select((state) => {
        return state.messageSet?.messages.map((m) => {
            return {
                messageSetId: state.messageSet.messageSetId,
                id: m.id,
                subject: m.properties.subject,
                sequenceNumber: m.properties.sequenceNumber,
                messageChannel: state.messageSet.messagesChannel,
            } as IMessageTableRow;
        });
    });

    // effects
    loadMessageSet = this.effect((messageSetId$: Observable<string>) => {
        return messageSetId$.pipe(
            switchMap((messageSetId: string) => this.store.select(getMessages(messageSetId))),
            tap((messageSet: IMessageSet) => {
                this.setMessageSet(messageSet);
            })
        );
    });

    requeueAllMessages = this.effect((o: Observable<never>) => {
        return o.pipe(
            withLatestFrom(this.messageSet$),
            tap(([_, messageSet]: [never, IMessageSet]) => {
                return this.store.dispatch(
                    sendMessages({
                        connectionId: messageSet.connectionId,
                        operationId: uuidv4(),
                        queueOrTopicName: messageSet.queueName ?? messageSet.topicName,
                        messages: messageSet.messages,
                    })
                );
            }),
            map(() => void 0)
        );
    });

    // updaters
    setCurrentMessage = this.updater((state, messageId: string) => {
        return {
            ...state,
            selectedMessageId: messageId,
        };
    });

    private setMessageSet = this.updater((state, messageSet: IMessageSet) => {
        return {
            ...state,
            messageSet,
        };
    });

    constructor(private store: Store<State>) {
        super({});
    }
}
