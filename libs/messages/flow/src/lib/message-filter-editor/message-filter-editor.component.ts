import {
  Component,
  computed,
  effect,
  linkedSignal,
  model,
  signal,
} from '@angular/core';

import { Drawer } from 'primeng/drawer';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { AccordionModule } from 'primeng/accordion';

import {
  MessageFilter,
  SYSTEM_PROPERTIES,
} from '@service-bus-browser/messages-contracts';
import { filterIsValid } from '@service-bus-browser/filtering';
import { Tag } from 'primeng/tag';
import {
  applyEach,
  FieldTree,
  form,
  FormField,
  required,
} from '@angular/forms/signals';
import { Checkbox } from 'primeng/checkbox';
import { SelectSignalFormInput } from './select-signal-form-input/select-signal-form-input';
import { DatePickerSignalFormInput } from './date-picker-signal-form-input/date-picker-signal-form-input';

@Component({
  selector: 'lib-message-filter-editor',
  standalone: true,
  imports: [
    Drawer,
    Button,
    InputText,
    AccordionModule,
    Tag,
    Checkbox,
    FormField,
    SelectSignalFormInput,
    DatePickerSignalFormInput,
  ],
  templateUrl: './message-filter-editor.component.html',
  styleUrls: ['./message-filter-editor.component.scss'],
})
export class MessageFilterEditorComponent {
  visible = model<boolean>(false);
  filters = model.required<MessageFilter>();
  shadowFilter = signal<MessageFilter>({
    systemProperties: [],
    applicationProperties: [],
    body: [],
  })

  filterForm = form(this.shadowFilter, (s) => {
    applyEach(s.systemProperties, (systemProperty) => {
      required(systemProperty.fieldName);
      required(systemProperty.fieldType);
      required(systemProperty.filterType);
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

  // Dropdown options
  systemPropertyOptions = Object.entries(SYSTEM_PROPERTIES).map(([key]) => ({
    label: key,
    value: key,
  }));

  propertyTypes = [
    { label: 'Text', value: 'string' },
    { label: 'Date', value: 'date' },
    { label: 'Number', value: 'number' },
    { label: 'Boolean', value: 'boolean' },
  ];

  stringFilterTypes = [
    { label: 'Contains', value: 'contains' },
    { label: 'Equals', value: 'equals' },
    { label: 'Regex', value: 'regex' },
    { label: 'Not contains', value: 'notcontains' },
    { label: 'Not equals', value: 'notequals' },
    { label: 'Not regex', value: 'notregex' },
  ];

  dateFilterTypes = [
    { label: 'Before', value: 'before' },
    { label: 'After', value: 'after' },
    { label: 'Equals', value: 'equals' },
    { label: 'Not equals', value: 'notequals' },
  ];

  numberFilterTypes = [
    { label: 'Greater Than', value: 'greater' },
    { label: 'Less Than', value: 'less' },
    { label: 'Equals', value: 'equals' },
    { label: 'Not equals', value: 'notequals' },
  ];

  bodyFilterTypes = [
    { label: 'Contains', value: 'contains' },
    { label: 'Regex', value: 'regex' },
    { label: 'Not contains', value: 'notcontains' },
    { label: 'Not regex', value: 'notregex' },
  ];

  systemFilterTag = computed(() => {
    const shadowFilter = this.shadowFilter();
    const filterCount = shadowFilter.systemProperties.filter(
      (f) => f.isActive,
    ).length;
    const activeFiltersCount = shadowFilter.systemProperties.filter(
      (f) => f.isActive,
    ).length;

    if (filterCount === 0) {
      return undefined;
    }

    return `${activeFiltersCount}/${filterCount}`;
  });

  applicationFilterTag = computed(() => {
    const shadowFilter = this.shadowFilter();
    const filterCount = shadowFilter.applicationProperties.filter(
      (f) => f.isActive,
    ).length;
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
    const filterCount = shadowFilter.body.filter((f) => f.isActive).length;
    const activeFiltersCount = shadowFilter.body.filter(
      (f) => f.isActive,
    ).length;

    if (filterCount === 0) {
      return undefined;
    }

    return `${activeFiltersCount}/${filterCount}`;
  });

  constructor() {
    effect(() => {
      const filter = this.filters();
      this.shadowFilter.set({
        systemProperties: filter.systemProperties.map((f) => ({...f})) ?? [],
        applicationProperties: filter.applicationProperties.map((f) => ({...f})) ?? [],
        body: filter.body.map((f) => ({...f})) ?? [],
      });
    });
  }

  protected addSystemPropertyFilter() {
    this.shadowFilter.update((f) => ({
      ...f,
      systemProperties: [
        ...f.systemProperties,
        {
          isActive: true,
          fieldName: '',
          fieldType: 'string',
          filterType: 'equals',
          value: '',
        },
      ],
    }));
  }

  protected removeSystemPropertyFilter(index: number) {
    this.shadowFilter.update((f) => ({
      ...f,
      systemProperties: [
        ...f.systemProperties.slice(0, index),
        ...f.systemProperties.slice(index + 1),
      ],
    }));
  }

  protected addApplicationPropertyFilter() {
    this.shadowFilter.update((f) => ({
      ...f,
      applicationProperties: [
        ...f.applicationProperties,
        {
          isActive: true,
          fieldName: '',
          fieldType: 'string',
          filterType: 'equals',
          value: '',
        },
      ],
    }))
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
    this.shadowFilter.set(this.filters());
    this.visible.set(false);
  }

  protected onClearAll() {
    this.shadowFilter.set({
      systemProperties: [],
      applicationProperties: [],
      body: [],
    })
  }

  protected onApply() {
    this.filters.set(this.shadowFilter());
    this.visible.set(false);
  }

  protected isFilterValid(): boolean {
    return filterIsValid(this.shadowFilter());
  }

  protected asStringValueTree(
    value: FieldTree<unknown, string>,
  ): FieldTree<string, string> {
    return value as FieldTree<string, string>;
  }

  protected asDateValueTree(
    value: FieldTree<unknown, string>,
  ): FieldTree<Date, string> {
    return value as FieldTree<Date, string>;
  }

  protected asNumberValueTree(
    value: FieldTree<unknown, string>,
  ): FieldTree<number, string> {
    return value as FieldTree<number, string>;
  }

  protected asBooleanValueTree(
    value: FieldTree<unknown, string>,
  ): FieldTree<boolean, string> {
    return value as FieldTree<boolean, string>;
  }
}
