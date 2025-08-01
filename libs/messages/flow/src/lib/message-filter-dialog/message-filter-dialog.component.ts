import { Component, computed, inject, input, linkedSignal, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { Button, ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { DatePicker } from 'primeng/datepicker';
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
import { Select, SelectModule } from 'primeng/select';
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
    DatePicker,
    InputNumber,
    Checkbox,
    AccordionModule,
    SelectModule,
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
  shadowCurrentFilters = linkedSignal(this.currentFilters);
  isFilterValid = computed(() => {
    return this.filterService.filterIsValid(this.shadowCurrentFilters());
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

  getSystemPropertyOptions() {
    return Object.entries(SYSTEM_PROPERTIES).map(([key, type]) => ({
      label: key,
      value: key,
    }));
  }

  addSystemPropertyFilter() {
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
  }

  removeSystemPropertyFilter(index: number) {
    this.currentFilters.update((current) => ({
      ...current,
      systemProperties: current.systemProperties.filter((_, i) => i !== index),
    }));
  }

  onSystemPropertyChange(index: number, field: keyof PropertyFilter, value: unknown, useShadow = false) {
    const signalToUpdate = useShadow ? this.shadowCurrentFilters : this.currentFilters;

    signalToUpdate.update((current) => ({
      ...current,
      systemProperties: current.systemProperties.map((filter, i) => {
        if (i !== index) {
          return filter;
        }

        return {
          ...filter,
          [field]: value,
        }
      })
    }));
  }

  addApplicationPropertyFilter() {
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
  }

  removeApplicationPropertyFilter(index: number) {
    this.currentFilters.update((current) => ({
      ...current,
      applicationProperties: current.applicationProperties.filter(
        (_, i) => i !== index
      ),
    }));
  }

  onApplicationPropertyTypeChange(index: number, field: keyof PropertyFilter, value: unknown, useShadow = false) {
    const signalToUpdate = useShadow ? this.shadowCurrentFilters : this.currentFilters;

    signalToUpdate.update((current) => ({
      ...current,
      applicationProperties: current.applicationProperties.map((filter, i) => {
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

  addBodyFilter() {
    const newFilter: BodyFilter = {
      filterType: 'contains',
      value: '',
      isActive: true,
    };
    this.currentFilters.update((current) => ({
      ...current,
      body: [...current.body, newFilter],
    }));
  }

  removeBodyFilter(index: number) {
    this.currentFilters.update((current) => ({
      ...current,
      body: current.body.filter((_, i) => i !== index),
    }));
  }

  onBodyFilterTypeChange(index: number, field: keyof BodyFilter, value: unknown, useShadow = false) {
    const signalToUpdate = useShadow ? this.shadowCurrentFilters : this.currentFilters;

    signalToUpdate.update((current) => ({
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

  syncShadowFilters() {
    this.currentFilters.set(this.shadowCurrentFilters());
  }

  onApply() {
    this.filtersUpdated.emit(this.currentFilters());
    this.visible.set(false);
  }

  onCancel() {
    this.currentFilters.set(this.filters());
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
