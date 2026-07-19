import {
  Component,
  computed,
  effect,
  inject,
  model,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ReceiveEndpoint, ReceiveOptions } from '@service-bus-browser/api-contracts';
import { NgTemplateOutlet } from '@angular/common';
import { messagesActions } from '@service-bus-browser/messages-store';
import {
  SbbButton,
  SbbDialog,
  SbbFloatLabel,
  SbbInput,
  SbbInputNumber,
  SbbMessage,
  SbbSelect,
  SbbSelectButton,
  SbbSelectOption,
} from '@service-bus-browser/shared-ui';

@Component({
  selector: 'lib-receive-messages-dialog',
  imports: [
    SbbDialog,
    SbbFloatLabel,
    FormsModule,
    SbbButton,
    SbbInput,
    SbbInputNumber,
    NgTemplateOutlet,
    SbbSelect,
    SbbSelectButton,
    SbbMessage,
  ],
  templateUrl: './receive-messages-dialog.html',
  changeDetection: ChangeDetectionStrategy.Eager,
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

  protected updateOptions(
    fieldName: string,
    value: string | number | undefined,
  ) {
    this.options.update((options) => ({
      ...options,
      [fieldName]: value,
    }));
  }

  protected cancelLoadMessages() {
    this.options.set(this.defaultOptions);
    this.receiveEndpoint.set(undefined);
  }

  /** Maps a plain string enum (`ReceiveOptionType` of type `'enum'`) to `SbbSelect` options. */
  protected enumSelectOptions(values: string[]): SbbSelectOption<string>[] {
    return values.map((value) => ({ label: value, value }));
  }

  /** Coerces a stored option value (`string | number | undefined`) to `SbbInputNumber`'s `number | null`. */
  protected toNumberValue(value: string | number | undefined): number | null {
    if (value === undefined || value === '') {
      return null;
    }

    return typeof value === 'number' ? value : Number(value);
  }
}
