import {
  Component,
  computed,
  effect,
  inject,
  model,
  signal,
} from '@angular/core';

import { ColorThemeService } from '@service-bus-browser/services';
import {
  CustomPropertyType,
  SendMessagesForm,
  SystemPropertyKeys
} from './form';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FloatLabel } from 'primeng/floatlabel';
import { ScrollPanel } from 'primeng/scrollpanel';
import { Button, ButtonDirective } from 'primeng/button';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { Popover } from 'primeng/popover';
import { DurationInputComponent, FormEditor } from '@service-bus-browser/shared-components';
import { EndpointSelectorInputComponent } from '@service-bus-browser/topology-components';
import { Store } from '@ngrx/store';
import { MessagesActions } from '@service-bus-browser/messages-store';
import { ActivatedRoute } from '@angular/router';
import { SystemKeyProperties } from '@service-bus-browser/messages-contracts';
import { SystemPropertyHelpers } from '../systemproperty-helpers';
import { getMessagesRepository } from '@service-bus-browser/messages-db';
import { NgTemplateOutlet } from '@angular/common';
import { Splitter } from 'primeng/splitter';
import { applyEach, form, FormField, required } from '@angular/forms/signals';
import { formHelpers } from '../form-helpers';
import { SelectSignalFormInput } from '../form/select-signal-form-input/select-signal-form-input';
import { DatePickerSignalFormInput } from '../form/date-picker-signal-form-input/date-picker-signal-form-input';
import { AutoCompleteFormInput } from '../form/auto-complete-form-input/auto-complete-form-input';

const repository = await getMessagesRepository();

@Component({
  selector: 'lib-send-message',
  imports: [
    AutoCompleteModule,
    FloatLabel,
    ScrollPanel,
    ButtonDirective,
    InputGroup,
    Button,
    InputGroupAddon,
    InputText,
    Popover,
    DurationInputComponent,
    EndpointSelectorInputComponent,
    FormEditor,
    NgTemplateOutlet,
    Splitter,
    FormField,
    SelectSignalFormInput,
    DatePickerSignalFormInput,
    AutoCompleteFormInput,
  ],
  templateUrl: './send-message.component.html',
  styleUrl: './send-message.component.scss',
})
export class SendMessageComponent {
  formHelpers = formHelpers;
  value = model<SendMessagesForm>(this.getEmptyForm());
  form = form(this.value, (s) => {
    required(s.endpoint);
    applyEach(s.systemProperties, (group) => {
      required(group.key);
    });
    applyEach(s.applicationProperties, (group) => {
      required(group.key);
    });
  });

  colorThemeService = inject(ColorThemeService);
  store = inject(Store);
  activatedRoute = inject(ActivatedRoute);
  systemPropertyHelpers = inject(SystemPropertyHelpers);

  typeOptions: Record<string, CustomPropertyType | string>[] = [
    { label: 'String', value: 'string'},
    { label: 'Datetime', value: 'datetime' },
    { label: 'Number', value: 'number' },
    { label: 'Boolean', value: 'boolean' },
  ];

  contentTypeSuggestions = computed(() => {
    if (this.contentTypeSearch() === null) {
      return [];
    }

    const contentTypes = [
      'application/json',
      'application/xml',
      'application/yaml',
      'application/ini',
      'application/toml',
      'text/csv',
      'text/plain',
    ];

    return contentTypes.filter((ct) =>
      ct.toLowerCase().includes((this.contentTypeSearch() ?? '').toLowerCase()),
    );
  });

  contentTypeSearch = signal<string | null>(null);
  contentType = computed(() => {
    const contentType = this.value().contentType;
    if (contentType) {
      return contentType;
    }
    return undefined;
  });
  bodyLanguage = computed(() => {
    const contentType = this.contentType() ?? '';

    if (contentType.includes('json')) {
      return 'json';
    }

    if (contentType.includes('xml')) {
      return 'xml';
    }

    if (contentType.includes('yaml') || contentType.includes('yml')) {
      return 'yaml';
    }

    if (contentType.includes('ini')) {
      return 'ini';
    }

    if (contentType.includes('toml')) {
      return 'TOML';
    }

    return 'text';
  });
  editorOptions = computed(() => {
    return {
      theme: this.colorThemeService.lightMode() ? 'vs-light' : 'vs-dark',
      automaticLayout: true,
      language: this.bodyLanguage(),
      minimap: {
        enabled: false,
      },
    };
  });

  addProperty() {
    this.value.update((v) => ({
      ...v,
      systemProperties: [
        ...v.systemProperties,
        {
          key: '',
          value: '',
        },
      ],
    }));
  }

  removeProperty(index: number) {
    this.value.update((v) => ({
      ...v,
      systemProperties: v.systemProperties.filter((_, i) => i !== index),
    }));
  }

  getAvailablePropertyKeys(index: number) {
    return SystemKeyProperties.filter(
      (key) =>
        !this.value().systemProperties.some(
          (p, i) => p.key === key && i !== index,
        ),
    ).map((key) => ({
      label: key,
      value: key,
    }));
  }

  propertyIsText(index: number) {
    const key = this.value().systemProperties[index].key;
    if (!key) {
      return false;
    }

    return this.systemPropertyHelpers.propertyIsText(key);
  }

  propertyIsDate(index: number) {
    const key = this.value().systemProperties[index].key;
    if (!key) {
      return false;
    }

    return this.systemPropertyHelpers.propertyIsDate(key);
  }

  propertyIsTimeSpan(index: number) {
    const key = this.value().systemProperties[index].key;
    if (!key) {
      return false;
    }

    return this.systemPropertyHelpers.propertyIsTimeSpan(key);
  }

  propertyUnknownType(index: number) {
    return (
      !this.propertyIsText(index) &&
      !this.propertyIsDate(index) &&
      !this.propertyIsTimeSpan(index)
    );
  }

  addApplicationProperty() {
    this.value.update((v) => ({
      ...v,
      applicationProperties: [
        ...v.applicationProperties,
        {
          key: '',
          type: 'string',
          value: '',
        },
      ],
    }));
  }

  removeApplicationProperty(index: number) {
    this.value.update((v) => ({
      ...v,
      applicationProperties: v.applicationProperties.filter(
        (_, i) => i !== index,
      ),
    }));
  }

  send() {
    if (!this.form().valid) {
      return;
    }

    // send message
    const formValue = this.value();

    this.store.dispatch(
      MessagesActions.sendMessage({
        endpoint: formValue.endpoint!,
        message: {
          body: formValue.body,
          contentType: formValue.contentType ?? undefined,
          timeToLive: (formValue.systemProperties.find(
            (x) => x.key === 'timeToLive',
          )?.value ?? undefined) as string | undefined,
          messageId: (formValue.systemProperties.find(
            (x) => x.key === 'messageId',
          )?.value ?? undefined) as string | undefined,
          correlationId: (formValue.systemProperties.find(
            (x) => x.key === 'correlationId',
          )?.value ?? undefined) as string | undefined,
          to: (formValue.systemProperties.find((x) => x.key === 'to')?.value ??
            undefined) as string | undefined,
          replyTo: (formValue.systemProperties.find((x) => x.key === 'replyTo')
            ?.value ?? undefined) as string | undefined,
          replyToSessionId: (formValue.systemProperties.find(
            (x) => x.key === 'replyToSessionId',
          )?.value ?? undefined) as string | undefined,
          sessionId: (formValue.systemProperties.find(
            (x) => x.key === 'sessionId',
          )?.value ?? undefined) as string | undefined,
          subject: (formValue.systemProperties.find((x) => x.key === 'subject')
            ?.value ?? undefined) as string | undefined,
          partitionKey: (formValue.systemProperties.find(
            (x) => x.key === 'partitionKey',
          )?.value ?? undefined) as string | undefined,
          scheduledEnqueueTimeUtc: (formValue.systemProperties.find(
            (x) => x.key === 'scheduledEnqueueTimeUtc',
          )?.value ?? undefined) as Date | undefined,
          applicationProperties: formValue.applicationProperties.reduce(
            (acc, x) => {
              acc[x.key] = x.value;
              return acc;
            },
            {} as Record<string, string | number | Date | boolean>,
          ),
        },
      }),
    );
  }

  constructor() {
    this.activatedRoute.params
      .pipe(
        takeUntilDestroyed(),
        switchMap((params) => {
          if (params['pageId'] && params['messageId']) {
            return repository.getMessage(params['pageId'], params['messageId']);
          }

          return [undefined];
        }),
      )
      .subscribe((message) => {
        if (!message) {
          this.value.set(this.getEmptyForm());
          return;
        }

        const systemProperties = Object.entries(message)
          .filter(
            ([key]) =>
              key !== 'body' &&
              key !== 'contentType' &&
              key !== 'applicationProperties',
          )
          .filter(([key, value]) => value && SystemPropertyKeys.includes(key as SystemPropertyKeys))
          .map(([key, value]) => ({
            key: key as SystemPropertyKeys,
            value: (value ?? '') as string | Date,
          }));

        this.value.set({
          body: message.body,
          contentType: message.contentType ?? '',
          systemProperties: systemProperties,
          applicationProperties: message.applicationProperties
            ? Object.entries(message.applicationProperties).map(
                ([key, value]) => {
                  return {
                    key,
                    type:
                      typeof value === 'string'
                        ? 'string'
                        : typeof value === 'number'
                          ? 'number'
                          : typeof value === 'boolean'
                            ? 'boolean'
                            : ('datetime' as CustomPropertyType),
                    value: value ?? '',
                  };
                },
              )
            : [],
          endpoint: null,
        });
      });
  }

  getEmptyForm(): SendMessagesForm {
    return {
      body: '',
      contentType: '',
      systemProperties: [],
      applicationProperties: [],
      endpoint: null,
    };
  }
}
