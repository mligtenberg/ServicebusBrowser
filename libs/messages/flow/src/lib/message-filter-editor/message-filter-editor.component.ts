import {
  Component,
  computed,
  effect,
  model,
  signal,
} from '@angular/core';

import { Drawer } from 'primeng/drawer';
import { Button } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';

import {
  MessageFilter,
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
import { SystemPropertyForm } from './system-property-form/system-property-form';
import { bodyFilterTypes } from './options';
import { ApplicationPropertyForm } from './application-property-form/application-property-form';
import { BodyPropertyForm } from './body-property-form/body-property-form';

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
  shadowFilter = signal<MessageFilter>({
    systemProperties: [],
    applicationProperties: [],
    body: [],
  });

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

  systemFilterTag = computed(() => {
    const shadowFilter = this.shadowFilter();
    const filterCount = shadowFilter.systemProperties.length;
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
        systemProperties: filter.systemProperties.map((f) => ({ ...f })) ?? [],
        applicationProperties:
          filter.applicationProperties.map((f) => ({ ...f })) ?? [],
        body: filter.body.map((f) => ({ ...f })) ?? [],
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
      systemProperties: this.filters().systemProperties.map((f) => ({ ...f })),
      applicationProperties: this.filters().applicationProperties.map(
        (f) => ({ ...f }),
      ),
      body: this.filters().body.map((f) => ({ ...f })),
    });
    this.visible.set(false);
  }

  protected onClearAll() {
    this.shadowFilter.set({
      systemProperties: [],
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
}
