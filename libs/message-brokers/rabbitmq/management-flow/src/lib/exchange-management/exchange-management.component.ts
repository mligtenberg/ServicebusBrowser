import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExchangeForm } from './form';
import { combineLatest, from, map, of, switchMap } from 'rxjs';
import { UUID } from '@service-bus-browser/shared-contracts';
import { Card } from 'primeng/card';
import { InputText } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { Checkbox } from 'primeng/checkbox';
import { ButtonDirective } from 'primeng/button';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  RabbitMqManagementFrontendClient,
  RabbitMqExchange,
} from '@service-bus-browser/service-bus-frontend-clients';
import { RefreshUtil } from '../refresh-util';
import { Logger } from '@service-bus-browser/logs-services';

@Component({
  selector: 'lib-rabbitmq-exchange-management',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Card,
    InputText,
    FloatLabel,
    Checkbox,
    ButtonDirective,
    Select,
    TableModule,
  ],
  templateUrl: './exchange-management.component.html',
  styleUrl: './exchange-management.component.scss',
})
export class ExchangeManagementComponent {
  activeRoute = inject(ActivatedRoute);
  managementClient = inject(RabbitMqManagementFrontendClient);
  refreshUtil = inject(RefreshUtil);
  logger = inject(Logger);

  form = this.createForm();

  action = signal<'create' | 'modify'>('create');
  connectionId = signal<string>('');
  vhostName = signal<string>('');
  currentExchange = signal<RabbitMqExchange | undefined>(undefined);

  currentExchangeInformation = computed(() => {
    const exchange = this.currentExchange();
    if (!exchange) {
      return [];
    }

    return [
      { key: 'Name', value: exchange.name },
      { key: 'VHost', value: exchange.vhost },
      { key: 'Type', value: exchange.type },
      { key: 'Durable', value: String(exchange.durable) },
      { key: 'Auto Delete', value: String(exchange.auto_delete) },
      { key: 'Internal', value: String(exchange.internal) },
    ];
  });

  informationCols = [
    { field: 'key', header: 'Property' },
    { field: 'value', header: 'Value' },
  ];

  exchangeTypeOptions = [
    { label: 'Direct', value: 'direct' },
    { label: 'Fanout', value: 'fanout' },
    { label: 'Topic', value: 'topic' },
    { label: 'Headers', value: 'headers' },
  ];

  constructor() {
    combineLatest([this.activeRoute.params, this.activeRoute.data])
      .pipe(
        switchMap(([params, data]) => {
          const action = data['action'] as 'create' | 'modify';
          const connectionId = params['connectionId'] as UUID | undefined;
          const vhostName = params['vhostName'] as string | undefined;
          const exchangeName = params['exchangeName'] as string | undefined;

          if (!connectionId) {
            throw new Error('Connection ID is required');
          }
          if (!vhostName) {
            throw new Error('VHost name is required');
          }

          this.connectionId.set(connectionId);
          this.vhostName.set(decodeURIComponent(vhostName));

          if (action === 'create') {
            return of({ action: 'create' as const, exchange: undefined });
          }

          if (!exchangeName) {
            throw new Error('Exchange name is required for modify action');
          }

          return from(
            this.managementClient.getExchange(
              connectionId,
              decodeURIComponent(vhostName),
              decodeURIComponent(exchangeName),
            ),
          ).pipe(map((exchange) => ({ action: 'modify' as const, exchange })));
        }),
        takeUntilDestroyed(),
      )
      .subscribe(({ action, exchange }) => {
        this.form = this.createForm();
        this.action.set(action);
        this.currentExchange.set(exchange);

        if (action === 'create') {
          this.configureFormAsCreate();
          return;
        }

        this.configureFormAsEdit();

        if (!exchange) {
          return;
        }

        this.form.controls.name.setValue(exchange.name);
        this.form.controls.settings.setValue({
          type: exchange.type,
          durable: exchange.durable,
          autoDelete: exchange.auto_delete,
          internal: exchange.internal,
        });
      });
  }

  configureFormAsCreate(): void {
    this.form.controls.name.enable();
    this.form.controls.settings.enable();
  }

  configureFormAsEdit(): void {
    this.form.controls.name.disable();
    this.form.controls.settings.disable();
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      return;
    }

    const formValue = this.form.getRawValue();
    const connectionId = this.connectionId();
    const vhostName = this.vhostName();

    await this.managementClient.createExchange(
      connectionId,
      vhostName,
      formValue.name,
      formValue.settings.type,
      formValue.settings.durable,
      formValue.settings.autoDelete,
      formValue.settings.internal,
    );

    this.refreshUtil.refreshExchanges(connectionId, vhostName);
    this.logger.info(`Exchange '${formValue.name}' created successfully in vhost '${vhostName}'`);
  }

  private createForm() {
    return new FormGroup<ExchangeForm>({
      name: new FormControl<string>('', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      settings: new FormGroup({
        type: new FormControl<string>('direct', { nonNullable: true }),
        durable: new FormControl<boolean>(true, { nonNullable: true }),
        autoDelete: new FormControl<boolean>(false, { nonNullable: true }),
        internal: new FormControl<boolean>(false, { nonNullable: true }),
      }),
    });
  }
}
