import * as actions from './messages.actions';
import * as internalActions from './messages.internal-actions';
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { MessageService } from 'primeng/api';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessagesToastsEffects {
  actions$ = inject(Actions);
  messageService = inject(MessageService);

  showMessageSendSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.sendedMessage),
    tap(({endpoint}) => {
      this.messageService.add({
        severity: 'success',
        summary: 'Message sent',
        detail: `Message was successfully sent, to ${'queueName' in endpoint ? endpoint.queueName : endpoint.topicName}`
      });
    })
  ), { dispatch: false });

  showMessageSendFailed$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.messageSendFailed),
    tap(({endpoint}) => {
      this.messageService.add({
        severity: 'error',
        summary: 'Message send failed',
        detail: `Failed to send message to ${'queueName' in endpoint ? endpoint.queueName : endpoint.topicName}`
      });
    })
  ), { dispatch: false });
}
