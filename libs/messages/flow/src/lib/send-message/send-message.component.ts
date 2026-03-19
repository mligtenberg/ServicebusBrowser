import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  inject,
  model,
  OnDestroy,
  signal,
  viewChild,
} from '@angular/core';

import { ColorThemeService } from '@service-bus-browser/services';
import {
  CustomPropertyType,
  SendMessagesForm,
  AmqpPropertyKeys,
  AmqpHeaderKeys,
} from './form';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest, map, switchMap } from 'rxjs';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FloatLabel } from 'primeng/floatlabel';
import { ScrollPanel } from 'primeng/scrollpanel';
import { Button, ButtonDirective } from 'primeng/button';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { Popover } from 'primeng/popover';
import {
  DurationInputComponent,
  FormEditor,
} from '@service-bus-browser/shared-components';
import { EndpointSelectorInputComponent } from '@service-bus-browser/topology-components';
import { Store } from '@ngrx/store';
import { messagesActions } from '@service-bus-browser/messages-store';
import { ActivatedRoute } from '@angular/router';
import {
  AmqpHeaderKeys as AmqpHeaderKeysList,
  AmqpPropertyKeys as AmqpPropertyKeysList,
} from './form';
import { getMessagesRepository } from '@service-bus-browser/messages-db';
import { NgTemplateOutlet } from '@angular/common';
import { Splitter } from 'primeng/splitter';
import { applyEach, form, FormField, required } from '@angular/forms/signals';
import { formHelpers } from '../form-helpers';
import { SelectSignalFormInput } from '../form/select-signal-form-input/select-signal-form-input';
import { DatePickerSignalFormInput } from '../form/date-picker-signal-form-input/date-picker-signal-form-input';
import { AutoCompleteFormInput } from '../form/auto-complete-form-input/auto-complete-form-input';
import {
  SendEndpoint,
  ToMessageToSend,
} from '@service-bus-browser/api-contracts';
import { Actions, ofType } from '@ngrx/effects';
import { routerNavigatedAction } from '@ngrx/router-store';

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
export class SendMessageComponent implements AfterViewInit, OnDestroy {
  ResizeObserver: ResizeObserver | null = null;
  formContainer = viewChild.required('formContainer', {
    read: ElementRef,
  });

  formHelpers = formHelpers;
  value = model<SendMessagesForm>(this.getEmptyForm());
  form = form(this.value, (s) => {
    required(s.endpoint);
    applyEach(s.properties, (group) => {
      required(group.key);
    });
    applyEach(s.headers, (group) => {
      required(group.key);
    });
    applyEach(s.deliveryAnnotations, (group) => {
      required(group.key);
    });
    applyEach(s.messageAnnotations, (group) => {
      required(group.key);
    });
    applyEach(s.applicationProperties, (group) => {
      required(group.key);
    });
  });
  containerWidth = signal(0);

  colorThemeService = inject(ColorThemeService);
  store = inject(Store);
  activatedRoute = inject(ActivatedRoute);
  actions$ = inject(Actions);

  typeOptions: Record<string, CustomPropertyType | string>[] = [
    { label: 'String', value: 'string' },
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
      properties: [
        ...v.properties,
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
      properties: v.properties.filter((_, i) => i !== index),
    }));
  }

  getAvailablePropertyKeys(index: number) {
    return AmqpPropertyKeysList.filter(
      (key) =>
        !this.value().properties.some((p, i) => p.key === key && i !== index),
    ).map((key) => ({
      label: key,
      value: key,
    }));
  }

  getAvailableHeaderKeys(index: number) {
    return AmqpHeaderKeysList.filter(
      (key) =>
        !this.value().headers.some((h, i) => h.key === key && i !== index),
    ).map((key) => ({
      label: key,
      value: key,
    }));
  }

  headerIsBoolean(index: number) {
    const key = this.value().headers[index].key;
    return key === 'durable' || key === 'first-acquirer';
  }

  headerIsNumber(index: number) {
    const key = this.value().headers[index].key;
    return key === 'priority' || key === 'ttl' || key === 'delivery-count';
  }

  propertyIsText(index: number) {
    const key = this.value().properties[index].key;
    if (!key) {
      return false;
    }

    return (
      key === 'message-id' ||
      key === 'user-id' ||
      key === 'to' ||
      key === 'subject' ||
      key === 'reply-to' ||
      key === 'correlation-id' ||
      key === 'content-type' ||
      key === 'content-encoding' ||
      key === 'group-id' ||
      key === 'reply-to-group-id'
    );
  }

  propertyIsDate(index: number) {
    const key = this.value().properties[index].key;
    if (!key) {
      return false;
    }

    return key === 'absolute-expiry-time' || key === 'creation-time';
  }

  propertyIsTimeSpan(index: number) {
    const key = this.value().properties[index].key;
    if (!key) {
      return false;
    }

    return false;
  }

  propertyIsNumber(index: number) {
    const key = this.value().properties[index].key;
    if (!key) {
      return false;
    }

    return key === 'group-sequence';
  }

  propertyUnknownType(index: number) {
    return (
      !this.propertyIsText(index) &&
      !this.propertyIsDate(index) &&
      !this.propertyIsTimeSpan(index) &&
      !this.propertyIsNumber(index)
    );
  }

  addApplicationProperty = () => {
    this.value.update((v) => ({
      ...v,
      applicationProperties: [
        ...(v.applicationProperties ?? []),
        {
          key: '',
          type: 'string',
          value: '',
        },
      ],
    }));
  };

  removeApplicationProperty = (index: number) => {
    this.value.update((v) => ({
      ...v,
      applicationProperties: (v.applicationProperties ?? []).filter(
        (_, i) => i !== index,
      ),
    }));
  };

  addHeaderProperty = () => {
    this.value.update((v) => ({
      ...v,
      headers: [
        ...(v.headers ?? []),
        {
          key: '',
          value: 0,
        },
      ],
    }));
  };

  removeHeaderProperty = (index: number) => {
    this.value.update((v) => ({
      ...v,
      headers: (v.headers ?? []).filter((_, i) => i !== index),
    }));
  };

  addDeliveryAnnotation = () => {
    this.value.update((v) => ({
      ...v,
      deliveryAnnotations: [
        ...(v.deliveryAnnotations ?? []),
        {
          key: '',
          type: 'string',
          value: '',
        },
      ],
    }));
  };

  removeDeliveryAnnotation = (index: number) => {
    this.value.update((v) => ({
      ...v,
      deliveryAnnotations: (v.deliveryAnnotations ?? []).filter(
        (_, i) => i !== index,
      ),
    }));
  };

  addMessageAnnotation = () => {
    this.value.update((v) => ({
      ...v,
      messageAnnotations: [
        ...(v.messageAnnotations ?? []),
        {
          key: '',
          type: 'string',
          value: '',
        },
      ],
    }));
  };

  removeMessageAnnotation = (index: number) => {
    this.value.update((v) => ({
      ...v,
      messageAnnotations: (v.messageAnnotations ?? []).filter(
        (_, i) => i !== index,
      ),
    }));
  };

  send() {
    if (!this.form().valid) {
      return;
    }

    // send message
    const formValue = this.value();
    const body = new TextEncoder().encode(formValue.body);

    const mapCustomPropertyGroups = (
      groups:
        | Array<{ key: string; value: string | number | Date | boolean }>
        | undefined,
    ) => {
      if (!groups) {
        return {} as Record<string, string | number | Date | boolean>;
      }

      return groups.reduce(
        (acc, group) => {
          if (!group.key) {
            return acc;
          }
          acc[group.key] = group.value;
          return acc;
        },
        {} as Record<string, string | number | Date | boolean>,
      );
    };

    this.store.dispatch(
      messagesActions.sendMessage({
        endpoint: formValue.endpoint!,
        message: {
          // toBase64 is supported by all browsers, but not in typescript yet
          bodyBase64: (body as any).toBase64(),
          contentType: formValue.contentType ?? undefined,
          messageId: (formValue.properties.find((x) => x.key === 'message-id')
            ?.value ?? undefined) as string | undefined,
          headers: mapCustomPropertyGroups(
            formValue.headers as Array<{
              key: string;
              value: string | number | Date | boolean;
            }>,
          ),
          deliveryAnnotations: mapCustomPropertyGroups(
            formValue.deliveryAnnotations,
          ),
          messageAnnotations: mapCustomPropertyGroups(
            formValue.messageAnnotations,
          ),
          properties: formValue.properties.reduce(
            (acc, x) => {
              acc[x.key] = x.value;
              return acc;
            },
            {
              ...(formValue.contentType
                ? { 'content-type': formValue.contentType }
                : {}),
            } as Record<string, string | number | Date | boolean>,
          ),
          applicationProperties: mapCustomPropertyGroups(
            formValue.applicationProperties,
          ),
        },
      }),
    );
  }

  constructor() {
    combineLatest([
      this.activatedRoute.params,
      this.actions$.pipe(ofType(routerNavigatedAction)),
    ])
      .pipe(
        takeUntilDestroyed(),
        map((params) => params[0]),
        switchMap((params) => {
          if (params['pageId'] && params['messageId']) {
            return repository.getMessage(params['pageId'], params['messageId']);
          }

          return [undefined];
        }),
      )
      .subscribe((receivedMessage) => {
        if (!receivedMessage) {
          this.value.set(this.getEmptyForm());
          const endpoint = window.history.state.sendEndpoint as
            | SendEndpoint
            | undefined;
          this.value.update((v) => ({
            ...v,
            endpoint: endpoint ?? null,
          }));
          return;
        }

        const message = ToMessageToSend(receivedMessage);

        const properties = Object.entries(message.properties ?? {})
          .filter(([key]) =>
            AmqpPropertyKeysList.includes(key as AmqpPropertyKeys),
          )
          .map(([key, value]) => ({
            key: key as AmqpPropertyKeys,
            value: (value ?? '') as string | Date | number,
          }));

        const legacyHeadersFromProperties = Object.entries(
          message.properties ?? {},
        )
          .filter(([key]) => AmqpHeaderKeysList.includes(key as AmqpHeaderKeys))
          .map(([key, value]) => {
            const typedKey = key as AmqpHeaderKeys;
            if (typedKey === 'durable' || typedKey === 'first-acquirer') {
              return {
                key: typedKey,
                value: Boolean(value),
              };
            }

            return {
              key: typedKey,
              value: Number(value ?? 0),
            };
          });

        const body = new TextDecoder().decode(message.body.buffer);
        const mapValueToGroup = ([key, value]: [string, unknown]) => {
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
            value: (value ?? '') as string | number | Date | boolean,
          };
        };

        const mapHeaderValueToGroup = ([key, value]: [string, unknown]) => {
          const typedKey = key as AmqpHeaderKeys;
          if (typedKey === 'durable' || typedKey === 'first-acquirer') {
            return {
              key: typedKey,
              value: Boolean(value),
            };
          }

          return {
            key: typedKey,
            value: Number(value ?? 0),
          };
        };

        this.value.set({
          body: body,
          contentType: message.contentType ?? '',
          properties: properties,
          headers: message.headers
            ? Object.entries(message.headers).map(mapHeaderValueToGroup)
            : legacyHeadersFromProperties,
          deliveryAnnotations: message.deliveryAnnotations
            ? Object.entries(message.deliveryAnnotations).map(mapValueToGroup)
            : [],
          messageAnnotations: message.messageAnnotations
            ? Object.entries(message.messageAnnotations).map(mapValueToGroup)
            : [],
          applicationProperties: message.applicationProperties
            ? Object.entries(message.applicationProperties).map(mapValueToGroup)
            : [],
          endpoint: null,
        });
      });
  }

  getEmptyForm(): SendMessagesForm {
    return {
      body: '',
      contentType: '',
      properties: [],
      headers: [],
      deliveryAnnotations: [],
      messageAnnotations: [],
      applicationProperties: [],
      endpoint: null,
    };
  }

  ngAfterViewInit() {
    this.ResizeObserver = new ResizeObserver((entries) => {
      this.containerWidth.set(entries[0].contentRect.width);
    });
    this.ResizeObserver.observe(this.formContainer().nativeElement);
  }

  ngOnDestroy() {
    this.ResizeObserver?.disconnect();
  }
}
