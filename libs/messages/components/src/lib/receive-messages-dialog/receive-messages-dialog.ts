import {
  Component,
  computed,
  effect,
  inject,
  model,
  signal,
} from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Store } from '@ngrx/store';
import { ReceiveEndpoint, ReceiveOptions } from '@service-bus-browser/api-contracts';
import { InputText } from 'primeng/inputtext';
import { NgTemplateOutlet } from '@angular/common';
import { Select } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';
import { messagesActions } from '@service-bus-browser/messages-store';

@Component({
  selector: 'lib-receive-messages-dialog',
  imports: [
    Dialog,
    FloatLabel,
    FormsModule,
    Button,
    InputText,
    NgTemplateOutlet,
    Select,
    SelectButton,
  ],
  templateUrl: './receive-messages-dialog.html',
  styleUrl: './receive-messages-dialog.scss',
})
export class ReceiveMessagesDialog {
  store = inject(Store);

  defaultOptions: ReceiveOptions = {
    maxAmountOfMessagesToReceive: 100,
    receiveMode: '',
  };

  receiveEndpoint = model<ReceiveEndpoint>();
  receiveModes = computed(() => {
    const currentEndpoint = this.receiveEndpoint();
    if (currentEndpoint === undefined) {
      return [];
    }

    return Object.keys(currentEndpoint.receiveOptionsDescription.modes);
  });

  defaultOptionModel = computed(() => {
    const currentEndpoint = this.receiveEndpoint();
    if (currentEndpoint === undefined) {
      return [];
    }

    const defaultOptions =
      currentEndpoint.receiveOptionsDescription.genericOptions;
    return Object.entries(defaultOptions).map(([key, value]) => ({
      fieldName: key,
      description: value,
    }));
  });

  modeOptionModel = computed(() => {
    const currentEndpoint = this.receiveEndpoint();
    const options = this.options();
    if (currentEndpoint === undefined) {
      return [];
    }

    const modeOptions =
      currentEndpoint.receiveOptionsDescription.modes[options.receiveMode] ??
      {};
    return Object.entries(modeOptions).map(([key, value]) => ({
      fieldName: key,
      description: value,
    }));
  });

  options = signal<ReceiveOptions>(this.defaultOptions);
  loadMessagesDialogVisible = computed(() => !!this.receiveEndpoint());

  constructor() {
    effect(() => {
      const receiveModes = this.receiveModes();
      if (receiveModes.length === 0) {
        return;
      }

      this.options.update((options) => {
        if (!receiveModes.includes(options.receiveMode)) {
          return {
            ...options,
            receiveMode: receiveModes[0],
          };
        }

        return options;
      });
    });
  }

  protected loadMessages() {
    const currentEndpoint = this.receiveEndpoint();
    if (currentEndpoint === undefined) {
      return;
    }

    this.store.dispatch(
      messagesActions.loadMessagesFromEndpoint({
        endpoint: currentEndpoint,
        options: this.options(),
      }),
    );

    this.options.set(this.defaultOptions);
    this.receiveEndpoint.set(undefined);
  }

  protected updateOptions(fieldName: string, value: string) {
    this.options.update((options) => ({
      ...options,
      [fieldName]: value,
    }));
  }

  protected cancelLoadMessages() {
    this.options.set(this.defaultOptions);
    this.receiveEndpoint.set(undefined);
  }
}
