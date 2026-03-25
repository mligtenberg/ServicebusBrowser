import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { QueueForm } from './form';
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
  RabbitMqQueue,
} from '@service-bus-browser/service-bus-frontend-clients';
import { RefreshUtil } from '../refresh-util';
import { Logger } from '@service-bus-browser/logs-services';

@Component({
  selector: 'lib-rabbitmq-queue-management',
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
  templateUrl: './queue-management.component.html',
  styleUrl: './queue-management.component.scss',
})
export class QueueManagementComponent {
  activeRoute = inject(ActivatedRoute);
  managementClient = inject(RabbitMqManagementFrontendClient);
  refreshUtil = inject(RefreshUtil);
  logger = inject(Logger);

  form = this.createForm();

  action = signal<'create' | 'modify'>('create');
  connectionId = signal<string>('');
  vhostName = signal<string>('');
  currentQueue = signal<RabbitMqQueue | undefined>(undefined);

  currentQueueInformation = computed(() => {
    const queue = this.currentQueue();
    if (!queue) {
      return [];
    }

    return [
      { key: 'Name', value: queue.name },
      { key: 'VHost', value: queue.vhost },
      { key: 'Type', value: queue.type },
      { key: 'Durable', value: String(queue.durable) },
      { key: 'Auto Delete', value: String(queue.auto_delete) },
      { key: 'Messages', value: String(queue.messages ?? 0) },
      { key: 'Messages Ready', value: String(queue.messages_ready ?? 0) },
      { key: 'Messages Unacknowledged', value: String(queue.messages_unacknowledged ?? 0) },
    ];
  });

  informationCols = [
    { field: 'key', header: 'Property' },
    { field: 'value', header: 'Value' },
  ];

  queueTypeOptions = [
    { label: 'Classic', value: 'classic' },
    { label: 'Quorum', value: 'quorum' },
    { label: 'Stream', value: 'stream' },
  ];

  constructor() {
    combineLatest([this.activeRoute.params, this.activeRoute.data])
      .pipe(
        switchMap(([params, data]) => {
          const action = data['action'] as 'create' | 'modify';
          const connectionId = params['connectionId'] as UUID | undefined;
          const vhostName = params['vhostName'] as string | undefined;
          const queueName = params['queueName'] as string | undefined;

          if (!connectionId) {
            throw new Error('Connection ID is required');
          }
          if (!vhostName) {
            throw new Error('VHost name is required');
          }

          this.connectionId.set(connectionId);
          this.vhostName.set(decodeURIComponent(vhostName));

          if (action === 'create') {
            return of({ action: 'create' as const, queue: undefined });
          }

          if (!queueName) {
            throw new Error('Queue name is required for modify action');
          }

          return from(
            this.managementClient.getQueue(
              connectionId,
              decodeURIComponent(vhostName),
              decodeURIComponent(queueName),
            ),
          ).pipe(map((queue) => ({ action: 'modify' as const, queue })));
        }),
        takeUntilDestroyed(),
      )
      .subscribe(({ action, queue }) => {
        this.form = this.createForm();
        this.action.set(action);
        this.currentQueue.set(queue);

        if (action === 'create') {
          this.configureFormAsCreate();
          return;
        }

        this.configureFormAsEdit();

        if (!queue) {
          return;
        }

        this.form.controls.name.setValue(queue.name);
        this.form.controls.settings.setValue({
          type: queue.type,
          durable: queue.durable,
          autoDelete: queue.auto_delete,
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

    await this.managementClient.createQueue(
      connectionId,
      vhostName,
      formValue.name,
      formValue.settings.durable,
      formValue.settings.autoDelete,
      formValue.settings.type,
    );

    this.refreshUtil.refreshQueues(connectionId, vhostName);
    this.logger.info(`Queue '${formValue.name}' created successfully in vhost '${vhostName}'`);
  }

  private createForm() {
    return new FormGroup<QueueForm>({
      name: new FormControl<string>('', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      settings: new FormGroup({
        type: new FormControl<'classic' | 'quorum' | 'stream'>('classic', {
          nonNullable: true,
        }),
        durable: new FormControl<boolean>(true, { nonNullable: true }),
        autoDelete: new FormControl<boolean>(false, { nonNullable: true }),
      }),
    });
  }
}
