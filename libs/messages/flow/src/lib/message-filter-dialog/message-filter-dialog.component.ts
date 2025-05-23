import { Component, computed, inject, input, linkedSignal, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { Button, ButtonDirective } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputText } from 'primeng/inputtext';
import { Calendar } from 'primeng/calendar';
import { InputNumber } from 'primeng/inputnumber';
import { Checkbox } from 'primeng/checkbox';
import { AccordionModule } from 'primeng/accordion';

import {
  MessageFilter,
  PropertyFilter,
  SYSTEM_PROPERTIES,
  StringFilter,
  BodyFilter
} from '@service-bus-browser/messages-contracts';
import { Select } from 'primeng/select';
import { MessageFilterService } from '../message-filter/message-filter.service';

@Component({
  selector: 'lib-message-filter-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Dialog,
    Button,
    InputText,
    Calendar,
    InputNumber,
    Checkbox,
    AccordionModule,
    DropdownModule,
    ButtonDirective,
    Select,
  ],
  templateUrl: './message-filter-dialog.component.html',
  styleUrls: ['./message-filter-dialog.component.scss'],
})
export class MessageFilterDialogComponent {
  filterService = inject(MessageFilterService);

  visible = model<boolean>(false);
  filters = input.required<MessageFilter>();
  currentFilters = linkedSignal(this.filters);
  currentOutwardsFilter = linkedSignal(this.filters);
  isFilterValid = computed(() => {
    return this.filterService.filterIsValid(this.currentOutwardsFilter());
  })
  filtersUpdated = output<MessageFilter>();

  // Dropdown options
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
  ];

  dateFilterTypes = [
    { label: 'Before', value: 'before' },
    { label: 'After', value: 'after' },
    { label: 'Equals', value: 'equals' },
  ];

  numberFilterTypes = [
    { label: 'Greater Than', value: 'greater' },
    { label: 'Less Than', value: 'less' },
    { label: 'Equals', value: 'equals' },
  ];

  bodyFilterTypes = [
    { label: 'Contains', value: 'contains' },
    { label: 'Regex', value: 'regex' },
  ];

  getSystemPropertyOptions() {
    return Object.entries(SYSTEM_PROPERTIES).map(([key, type]) => ({
      label: key,
      value: key,
    }));
  }

  addSystemPropertyFilter() {
    this.currentFilters.set(this.currentOutwardsFilter());
    const newFilter: StringFilter = {
      fieldName: '',
      fieldType: 'string',
      filterType: 'contains',
      value: '',
      isActive: true,
    };

    this.currentFilters.update((current) => ({
      ...current,
      systemProperties: [...current.systemProperties, newFilter],
    }));
    this.currentOutwardsFilter.set(this.currentFilters());
  }

  removeSystemPropertyFilter(index: number) {
    this.currentFilters.set(this.currentOutwardsFilter());
    this.currentFilters.update((current) => ({
      ...current,
      systemProperties: current.systemProperties.filter((_, i) => i !== index),
    }));
    this.currentOutwardsFilter.set(this.currentFilters());
  }

  onSystemPropertyChange(index: number, field: keyof PropertyFilter, value: unknown) {
    const currentFilters = this.currentOutwardsFilter();
    const updatedFilter: MessageFilter = {
      ...currentFilters,
      systemProperties: currentFilters.systemProperties.map((filter, i) => {
        if (i !== index) {
          return filter;
        }

        return {
          ...filter,
          [field]: value,
        }
      })
    }

    this.currentOutwardsFilter.set(updatedFilter);
  }

  addApplicationPropertyFilter() {
    this.currentFilters.set(this.currentOutwardsFilter());
    this.currentOutwardsFilter.set(this.currentFilters());
    const newFilter: StringFilter = {
      fieldName: '',
      fieldType: 'string',
      filterType: 'contains',
      value: '',
      isActive: true,
    };

    this.currentFilters.update((current) => ({
      ...current,
      applicationProperties: [...current.applicationProperties, newFilter],
    }));
    this.currentOutwardsFilter.set(this.currentFilters());
  }

  removeApplicationPropertyFilter(index: number) {
    this.currentFilters.set(this.currentOutwardsFilter());
    this.currentFilters.update((current) => ({
      ...current,
      applicationProperties: current.applicationProperties.filter(
        (_, i) => i !== index
      ),
    }));
    this.currentOutwardsFilter.set(this.currentFilters());
  }

  onApplicationPropertyTypeChange(index: number, field: keyof PropertyFilter, value: unknown) {
    const currentFilters = this.currentOutwardsFilter();
    const updatedFilter: MessageFilter = {
      ...currentFilters,
      applicationProperties: currentFilters.applicationProperties.map((filter, i) => {
        if (i !== index) {
          return filter;
        }

        return {
          ...filter,
          [field]: value,
        }
      })
    }

    this.currentOutwardsFilter.set(updatedFilter);
  }

  addBodyFilter() {
    this.currentFilters.set(this.currentOutwardsFilter());
    const newFilter: BodyFilter = {
      filterType: 'contains',
      value: '',
      isActive: true,
    };
    this.currentFilters.update((current) => ({
      ...current,
      body: [...current.body, newFilter],
    }));
    this.currentOutwardsFilter.set(this.currentFilters());
  }

  removeBodyFilter(index: number) {
    this.currentFilters.set(this.currentOutwardsFilter());
    this.currentFilters.update((current) => ({
      ...current,
      body: current.body.filter((_, i) => i !== index),
    }));
    this.currentOutwardsFilter.set(this.currentFilters());
  }

  onBodyFilterTypeChange(index: number, field: keyof BodyFilter, value: unknown) {
    this.currentOutwardsFilter.update((current) => ({
      ...current,
      body: current.body.map((filter, i) => {
        if (i !== index) {
          return filter;
        }

        return {
          ...filter,
          [field]: value,
        }
      })
    }))
  }

  onApply() {
    this.filtersUpdated.emit(this.currentOutwardsFilter());
    this.visible.set(false);
  }

  onCancel() {
    this.visible.set(false);
  }

  onClearAll() {
    this.currentFilters.set({
      systemProperties: [],
      applicationProperties: [],
      body: [],
    });
  }
}
