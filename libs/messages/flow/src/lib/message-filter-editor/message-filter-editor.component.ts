import {
  Component,
  computed,
  effect,
  input,
  model,
  signal,
} from '@angular/core';

import { Drawer } from 'primeng/drawer';
import { Button } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';

import {
  filterIsValid,
  MessageFilter,
  PropertyFilter,
} from '@service-bus-browser/filtering';
import { Tag } from 'primeng/tag';
import { applyEach, form, FormField, required } from '@angular/forms/signals';
import { SystemPropertyForm } from './system-property-form/system-property-form';
import { ApplicationPropertyForm } from './application-property-form/application-property-form';
import { BodyPropertyForm } from './body-property-form/body-property-form';

const DEFAULT_HEADER_PROPERTIES: { label: string; type: string }[] = [
  { label: 'durable', type: 'boolean' },
  { label: 'priority', type: 'number' },
  { label: 'ttl', type: 'timespan' },
  { label: 'first-acquirer', type: 'boolean' },
  { label: 'delivery-count', type: 'number' },
];

const DEFAULT_MESSAGE_PROPERTIES: { label: string; type: string }[] = [
  { label: 'message-id', type: 'string' },
  { label: 'user-id', type: 'string' },
  { label: 'to', type: 'string' },
  { label: 'subject', type: 'string' },
  { label: 'reply-to', type: 'string' },
  { label: 'correlation-id', type: 'string' },
  { label: 'content-type', type: 'string' },
  { label: 'content-encoding', type: 'string' },
  { label: 'absolute-expiry-time', type: 'date' },
  { label: 'creation-time', type: 'date' },
  { label: 'group-id', type: 'string' },
  { label: 'group-sequence', type: 'number' },
  { label: 'reply-to-group-id', type: 'string' },
];

@Component({
  selector: 'lib-message-filter-editor',
  standalone: true,
  imports: [
    Drawer,
    Button,
    AccordionModule,
    Tag,
    FormField,
    SystemPropertyForm,
    ApplicationPropertyForm,
    BodyPropertyForm,
  ],
  templateUrl: './message-filter-editor.component.html',
  styleUrls: ['./message-filter-editor.component.scss'],
})
export class MessageFilterEditorComponent {
  visible = model<boolean>(false);
  filters = model.required<MessageFilter>();
  knownHeaders = input<{ label: string; type: string }[]>(
    DEFAULT_HEADER_PROPERTIES,
  );
  knownDeliveryAnnotations = input<{ label: string; type: string }[]>([]);
  knownMessageAnnotations = input<{ label: string; type: string }[]>([]);
  knownProperties = input<{ label: string; type: string }[]>(
    DEFAULT_MESSAGE_PROPERTIES,
  );
  knownApplicationProperties = input<{ label: string; type: string }[]>([]);

  shadowFilter = signal<MessageFilter>({
    headers: [],
    deliveryAnnotations: [],
    messageAnnotations: [],
    properties: [],
    applicationProperties: [],
    body: [],
  });

  filterForm = form(this.shadowFilter, (s) => {
    applyEach(s.headers, (property) => {
      required(property.fieldName);
      required(property.fieldType);
      required(property.filterType);
    });
    applyEach(s.deliveryAnnotations, (property) => {
      required(property.fieldName);
      required(property.fieldType);
      required(property.filterType);
    });
    applyEach(s.messageAnnotations, (property) => {
      required(property.fieldName);
      required(property.fieldType);
      required(property.filterType);
    });
    applyEach(s.properties, (property) => {
      required(property.fieldName);
      required(property.fieldType);
      required(property.filterType);
    });
    applyEach(s.applicationProperties, (property) => {
      required(property.fieldName);
      required(property.fieldType);
      required(property.filterType);
    });
    applyEach(s.body, (property) => {
      required(property.filterType);
    });
  });

  headersFilterTag = computed(() => {
    const shadowFilter = this.shadowFilter();
    const filterCount = shadowFilter.headers.length;
    const activeFiltersCount = shadowFilter.headers.filter(
      (f) => f.isActive,
    ).length;

    if (filterCount === 0) {
      return undefined;
    }

    return `${activeFiltersCount}/${filterCount}`;
  });

  deliveryAnnotationsFilterTag = computed(() => {
    const shadowFilter = this.shadowFilter();
    const filterCount = shadowFilter.deliveryAnnotations.length;
    const activeFiltersCount = shadowFilter.deliveryAnnotations.filter(
      (f) => f.isActive,
    ).length;

    if (filterCount === 0) {
      return undefined;
    }

    return `${activeFiltersCount}/${filterCount}`;
  });

  messageAnnotationsFilterTag = computed(() => {
    const shadowFilter = this.shadowFilter();
    const filterCount = shadowFilter.messageAnnotations.length;
    const activeFiltersCount = shadowFilter.messageAnnotations.filter(
      (f) => f.isActive,
    ).length;

    if (filterCount === 0) {
      return undefined;
    }

    return `${activeFiltersCount}/${filterCount}`;
  });

  propertiesFilterTag = computed(() => {
    const shadowFilter = this.shadowFilter();
    const filterCount = shadowFilter.properties.length;
    const activeFiltersCount = shadowFilter.properties.filter(
      (f) => f.isActive,
    ).length;

    if (filterCount === 0) {
      return undefined;
    }

    return `${activeFiltersCount}/${filterCount}`;
  });

  applicationFilterTag = computed(() => {
    const shadowFilter = this.shadowFilter();
    const filterCount = shadowFilter.applicationProperties.length;
    const activeFiltersCount = shadowFilter.applicationProperties.filter(
      (f) => f.isActive,
    ).length;

    if (filterCount === 0) {
      return undefined;
    }

    return `${activeFiltersCount}/${filterCount}`;
  });

  bodyFilterTag = computed(() => {
    const shadowFilter = this.shadowFilter();
    const filterCount = shadowFilter.body.length;
    const activeFiltersCount = shadowFilter.body.filter(
      (f) => f.isActive,
    ).length;

    if (filterCount === 0) {
      return undefined;
    }

    return `${activeFiltersCount}/${filterCount}`;
  });

  constructor() {
    // not sure the filter is stored in ngrx or if this is because signal forms (still experimental)
    // but somehow a symbol function is missing if we used a linked signal
    effect(() => {
      const filter = this.filters();
      this.shadowFilter.set({
        headers: filter.headers.map((f) => ({ ...f })) ?? [],
        deliveryAnnotations:
          filter.deliveryAnnotations.map((f) => ({ ...f })) ?? [],
        messageAnnotations:
          filter.messageAnnotations.map((f) => ({ ...f })) ?? [],
        properties: filter.properties.map((f) => ({ ...f })) ?? [],
        applicationProperties:
          filter.applicationProperties.map((f) => ({ ...f })) ?? [],
        body: filter.body.map((f) => ({ ...f })) ?? [],
      });
    });
  }

  protected addHeaderFilter() {
    this.shadowFilter.update((f) => ({
      ...f,
      headers: [...f.headers, this.createPropertyFilter()],
    }));
  }

  protected removeHeaderFilter(index: number) {
    this.shadowFilter.update((f) => ({
      ...f,
      headers: [...f.headers.slice(0, index), ...f.headers.slice(index + 1)],
    }));
  }

  protected addDeliveryAnnotationFilter() {
    this.shadowFilter.update((f) => ({
      ...f,
      deliveryAnnotations: [
        ...f.deliveryAnnotations,
        this.createPropertyFilter(),
      ],
    }));
  }

  protected removeDeliveryAnnotationFilter(index: number) {
    this.shadowFilter.update((f) => ({
      ...f,
      deliveryAnnotations: [
        ...f.deliveryAnnotations.slice(0, index),
        ...f.deliveryAnnotations.slice(index + 1),
      ],
    }));
  }

  protected addMessageAnnotationFilter() {
    this.shadowFilter.update((f) => ({
      ...f,
      messageAnnotations: [
        ...f.messageAnnotations,
        this.createPropertyFilter(),
      ],
    }));
  }

  protected removeMessageAnnotationFilter(index: number) {
    this.shadowFilter.update((f) => ({
      ...f,
      messageAnnotations: [
        ...f.messageAnnotations.slice(0, index),
        ...f.messageAnnotations.slice(index + 1),
      ],
    }));
  }

  protected addPropertiesFilter() {
    this.shadowFilter.update((f) => ({
      ...f,
      properties: [...f.properties, this.createPropertyFilter()],
    }));
  }

  protected removePropertiesFilter(index: number) {
    this.shadowFilter.update((f) => ({
      ...f,
      properties: [
        ...f.properties.slice(0, index),
        ...f.properties.slice(index + 1),
      ],
    }));
  }

  protected addApplicationPropertyFilter() {
    this.shadowFilter.update((f) => ({
      ...f,
      applicationProperties: [
        ...f.applicationProperties,
        this.createPropertyFilter(),
      ],
    }));
  }

  protected removeApplicationPropertyFilter(index: number) {
    this.shadowFilter.update((f) => ({
      ...f,
      applicationProperties: [
        ...f.applicationProperties.slice(0, index),
        ...f.applicationProperties.slice(index + 1),
      ],
    }));
  }

  protected addBodyFilter() {
    this.shadowFilter.update((f) => ({
      ...f,
      body: [...f.body, { isActive: true, filterType: 'equals', value: '' }],
    }));
  }

  protected removeBodyFilter(index: number) {
    this.shadowFilter.update((f) => ({
      ...f,
      body: [...f.body.slice(0, index), ...f.body.slice(index + 1)],
    }));
  }

  protected onCancel() {
    this.shadowFilter.set({
      headers: this.filters().headers.map((f) => ({ ...f })),
      deliveryAnnotations: this.filters().deliveryAnnotations.map((f) => ({
        ...f,
      })),
      messageAnnotations: this.filters().messageAnnotations.map((f) => ({
        ...f,
      })),
      properties: this.filters().properties.map((f) => ({ ...f })),
      applicationProperties: this.filters().applicationProperties.map((f) => ({
        ...f,
      })),
      body: this.filters().body.map((f) => ({ ...f })),
    });
    this.visible.set(false);
  }

  protected onClearAll() {
    this.shadowFilter.set({
      headers: [],
      deliveryAnnotations: [],
      messageAnnotations: [],
      properties: [],
      applicationProperties: [],
      body: [],
    });
  }

  protected onApply() {
    this.filters.set(this.shadowFilter());
    this.visible.set(false);
  }

  protected isFilterValid(): boolean {
    return filterIsValid(this.shadowFilter());
  }

  private createPropertyFilter(): PropertyFilter {
    return {
      isActive: true,
      fieldName: '',
      fieldType: 'string',
      filterType: 'equals',
      value: '',
    } as PropertyFilter;
  }
}
