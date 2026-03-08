import { Component, computed, inject, model, signal } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputNumber } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { MessagesActions } from '@service-bus-browser/messages-store';
import { Store } from '@ngrx/store';
import { ReceiveEndpoint } from '@service-bus-browser/api-contracts';
import { SelectButton } from 'primeng/selectbutton';

@Component({
  selector: 'lib-receive-messages-operations-dialog',
  imports: [Dialog, FloatLabel, InputNumber, FormsModule, Button, SelectButton],
  templateUrl: './receive-messages-dialog.html',
  styleUrl: './receive-messages-dialog.scss',
})
export class ReceiveMessagesDialog {
  store = inject(Store);

  receiveEndpoint = model<ReceiveEndpoint>();

  maxAmount = signal(100);
  fromSequenceNumber = signal('0');
  receiveType = signal<'peek' | 'receive'>('peek');
  receiveTypes = ['peek', 'receive'];

  loadMessagesDialogVisible = computed(() => !!this.receiveEndpoint());

  protected loadMessages() {
    const currentEndpoint = this.receiveEndpoint();
    if (currentEndpoint === undefined) {
      return;
    }

    this.store.dispatch(
      MessagesActions.loadMessages({
        endpoint: currentEndpoint,
        maxAmount: this.maxAmount(),
        fromSequenceNumber: this.fromSequenceNumber().toString(),
        receiveType: this.receiveType(),
      }),
    );

    this.maxAmount.set(100);
    this.fromSequenceNumber.set('0');
    this.receiveType.set('peek');
    this.receiveEndpoint.set(undefined);
  }

  protected cancelLoadMessages() {
    this.maxAmount.set(100);
    this.fromSequenceNumber.set('0');
    this.receiveType.set('peek');
    this.receiveEndpoint.set(undefined);
  }
}
