import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorComponent } from 'ngx-monaco-editor-v2';
import { ColorThemeService } from '@service-bus-browser/services';
import { Card } from 'primeng/card';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomPropertyGroup, SendMessagesForm, SystemPropertyGroup, SystemPropertyKeys } from './form';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FloatLabel } from 'primeng/floatlabel';
import { ScrollPanel } from 'primeng/scrollpanel';
import { Button, ButtonDirective } from 'primeng/button';
import { InputGroup } from 'primeng/inputgroup';
import { Select } from 'primeng/select';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { DatePicker } from 'primeng/datepicker';
import { Popover } from 'primeng/popover';
import { DurationInputComponent } from '@service-bus-browser/shared-components';
import { EndpointSelectorInputComponent } from '@service-bus-browser/topology-components';
import { SendEndpoint } from '@service-bus-browser/service-bus-contracts';
import { Store } from '@ngrx/store';
import { MessagesActions, MessagesSelectors } from '@service-bus-browser/messages-store';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'lib-send-message',
  imports: [
    CommonModule,
    EditorComponent,
    Card,
    ReactiveFormsModule,
    AutoCompleteModule,
    FloatLabel,
    ScrollPanel,
    ButtonDirective,
    InputGroup,
    Select,
    Button,
    InputGroupAddon,
    InputText,
    DatePicker,
    Popover,
    DurationInputComponent,
    EndpointSelectorInputComponent,
  ],
  templateUrl: './send-message.component.html',
  styleUrl: './send-message.component.scss',
})
export class SendMessageComponent {
  colorThemeService = inject(ColorThemeService);
  store = inject(Store);
  activatedRoute = inject(ActivatedRoute);

  form = signal(this.createForm());

  typeOptions = ['string', 'datetime', 'number', 'boolean'];

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
      'text/plain',
    ];

    return contentTypes.filter((ct) =>
      ct.toLowerCase().includes((this.contentTypeSearch() ?? '').toLowerCase())
    );
  });

  contentTypeSearch = signal<string | null>(null);
  contentType = toSignal(
    toObservable(this.form).pipe(
      switchMap((form) => form.controls.contentType.valueChanges),
    )
  );
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
    return ({
      theme: this.colorThemeService.lightMode() ? 'vs-light' : 'vs-dark',
      automaticLayout: true,
      language: this.bodyLanguage(),
      minimap: {
        enabled: false,
      },
    })
  });

  addProperty() {
    this.form().controls.properties.push(
      new FormGroup<SystemPropertyGroup>({
        key: new FormControl<SystemPropertyKeys | null>(null, [
          Validators.required,
        ]),
        value: new FormControl<string | Date>('', {
          nonNullable: true,
          validators: [Validators.required],
        }),
      })
    );
  }

  removeProperty(index: number) {
    this.form().controls.properties.removeAt(index);
  }

  getAvailablePropertyKeys(index: number) {
    const keys = [
      'correlationId',
      'partitionKey',
      'sessionId',
      'replyToSessionId',
      'messageId',
      'subject',
      'to',
      'replyTo',
      'scheduledEnqueueTimeUtc',
      'timeToLive',
    ];
    return keys.filter(
      (key) =>
        !this.form().controls.properties.value.some(
          (p, i) => p.key === key && i !== index
        )
    );
  }

  propertyIsText(index: number) {
    const stringKeys = [
      'correlationId',
      'partitionKey',
      'sessionId',
      'replyToSessionId',
      'messageId',
      'subject',
      'to',
      'replyTo',
    ];
    return stringKeys.includes(
      this.form().controls.properties.value[index].key ?? ''
    );
  }

  propertyIsDate(index: number) {
    const dateKeys = ['scheduledEnqueueTimeUtc'];
    return dateKeys.includes(
      this.form().controls.properties.value[index].key ?? ''
    );
  }

  propertyIsTimeSpan(index: number) {
    const timeSpanKeys = ['timeToLive'];
    return timeSpanKeys.includes(
      this.form().controls.properties.value[index].key ?? ''
    );
  }

  propertyUnknownType(index: number) {
    return (
      !this.propertyIsText(index) &&
      !this.propertyIsDate(index) &&
      !this.propertyIsTimeSpan(index)
    );
  }

  addCustomProperty() {
    this.form().controls.customProperties.push(
      new FormGroup<CustomPropertyGroup>({
        key: new FormControl<string>('', {
          nonNullable: true,
          validators: [Validators.required],
        }),
        value: new FormControl<string | number | Date | boolean>('', {
          nonNullable: true,
          validators: [Validators.required],
        }),
      })
    );
  }

  removeCustomProperty(index: number) {
    this.form().controls.customProperties.removeAt(index);
  }

  send() {
    if (!this.form().valid) {
      return;
    }

    // send message
    const formValue = this.form().getRawValue();

    this.store.dispatch(
      MessagesActions.sendMessage({
        endpoint: formValue.endpoint!,
        message: {
          body: formValue.body,
          contentType: formValue.contentType ?? undefined,
          timeToLive: (formValue.properties.find(x => x.key === "timeToLive")?.value ?? undefined) as string | undefined,
          messageId: (formValue.properties.find(x => x.key === "messageId")?.value ?? undefined) as string | undefined,
          correlationId: (formValue.properties.find(x => x.key === "correlationId")?.value ?? undefined) as string | undefined,
          to: (formValue.properties.find(x => x.key === "to")?.value ?? undefined) as string | undefined,
          replyTo: (formValue.properties.find(x => x.key === "replyTo")?.value ?? undefined) as string | undefined,
          replyToSessionId: (formValue.properties.find(x => x.key === "replyToSessionId")?.value ?? undefined) as string | undefined,
          sessionId: (formValue.properties.find(x => x.key === "sessionId")?.value ?? undefined) as string | undefined,
          subject: (formValue.properties.find(x => x.key === "subject")?.value ?? undefined) as string | undefined,
          partitionKey: (formValue.properties.find(x => x.key === "partitionKey")?.value ?? undefined) as string | undefined,
          scheduledEnqueueTimeUtc: (formValue.properties.find(x => x.key === "scheduledEnqueueTimeUtc")?.value ?? undefined) as Date | undefined,
          applicationProperties: formValue.customProperties.reduce((acc, x) => {
            acc[x.key] = x.value;
            return acc;
          }, {} as Record<string, string | number | Date | boolean>),
        }
      })
    )
  }

  constructor() {
    this.activatedRoute.params.pipe(
      takeUntilDestroyed(),
      switchMap((params) => {
        if (params['pageId'] && params['messageId']) {
          return this.store.select(MessagesSelectors.selectMessage(params['pageId'], params['messageId']));
        }

        return [undefined];
      })
    ).subscribe((message) => {
      this.form.set(this.createForm());

      if (!message) {
        return;
      }

      this.form().patchValue({
        body: message.body,
        contentType: message.contentType,
        customProperties: message.applicationProperties ? Object
          .entries(message.applicationProperties)
          .map(([key, value]) => ({
            key,
            value: value ?? ''
          })) : [],
        properties: Object
          .entries(message)
          .filter(([key]) => key !== 'body' && key !== 'contentType' && key !== 'applicationProperties')
          .map(([key, value]) => ({
            key: key as SystemPropertyKeys,
            value: value ?? ''
        }))
    });
  });
  }

  private createForm() {
    return new FormGroup<SendMessagesForm>({
      body: new FormControl<string>('', {
        nonNullable: true,
      }),
      contentType: new FormControl(''),
      properties: new FormArray<FormGroup<SystemPropertyGroup>>([]),
      customProperties: new FormArray<FormGroup<CustomPropertyGroup>>([]),
      endpoint: new FormControl<SendEndpoint | null>(null, {
        validators: [Validators.required],
      })
    });
  }
}
