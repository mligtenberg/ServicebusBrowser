import { Component, computed, effect, inject, model, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import {
  ConnectionsActions,
  ConnectionsEffectActions,
  ConnectionsSelectors,
} from '@service-bus-browser/connections-store';
import {
  Connection,
  MessageQueueTargetType,
} from '@service-bus-browser/api-contracts';
import { Problem, UUID } from '@service-bus-browser/shared-contracts';
import {
  SbbButton,
  SbbFloatLabel,
  SbbInput,
  SbbMenuItem,
  SbbSelect,
  SbbSplitButton,
} from '@service-bus-browser/shared-ui';
import { ServiceBusConnectionTargetComponent } from './connection-targets/service-bus/service-bus-connection-target.component';
import { RabbitmqConnectionTargetComponent } from './connection-targets/rabbitmq/rabbitmq-connection-target.component';
import { EventHubConnectionTargetComponent } from './connection-targets/event-hub/event-hub-connection-target.component';

type ConnectionsBroadcastMessage = { type: 'connection-added'; name: string };

@Component({
  selector: 'lib-add-connection',
  imports: [
    CommonModule,
    FormsModule,
    SbbButton,
    SbbFloatLabel,
    SbbInput,
    SbbSelect,
    SbbSplitButton,
    ServiceBusConnectionTargetComponent,
    RabbitmqConnectionTargetComponent,
    EventHubConnectionTargetComponent,
  ],
  templateUrl: './add-connection.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './add-connection.component.scss',
})
export class AddConnectionComponent {
  store = inject(Store);
  private actions$ = inject(Actions);

  // Select connection test status from store
  connectionTestStatus$ = this.store.select(
    ConnectionsSelectors.selectConnectionTestStatus,
  );
  connectionTestError$ = this.store.select(
    ConnectionsSelectors.selectConnectionTestError,
  );

  connectionName = model<string>();
  connectionTarget = model<MessageQueueTargetType>('serviceBus');
  connectionTargets: Array<{ label: string; value: MessageQueueTargetType }> = [
    { label: 'Service Bus', value: 'serviceBus' },
    { label: 'RabbitMQ', value: 'rabbitmq' },
    { label: 'Event Hub', value: 'eventHub' },
  ];
  connection = model<Connection | undefined>();

  /** Set when a save is in flight; drives the "Save failed" panel below the actions. */
  saveError = signal<Problem | null>(null);

  canTest = computed(() => {
    return this.connection() !== undefined;
  });

  saveMenuItems: SbbMenuItem<void>[] = [
    {
      label: 'Save without testing',
      onSelect: () => this.saveWithoutTesting(),
    },
  ];

  /** True between a "Test & Save" click and its test result — routes a successful test into a save. */
  private testThenSave = false;
  private pendingSaveConnectionId: UUID | null = null;

  constructor() {
    // Reset connection test when connection changes — a stale success must
    // not let a since-changed connection save without re-testing. This only
    // gates the "Test & Save" success path; "Save without testing" is
    // unaffected.
    effect(() => {
      this.connection();
      this.store.dispatch(ConnectionsActions.resetConnectionTest());
    });

    effect(() => {
      this.connectionTarget();
      this.connection.set(undefined);
    });

    this.actions$
      .pipe(
        ofType(ConnectionsEffectActions.connectionCheckedSuccessfully),
        takeUntilDestroyed(),
      )
      .subscribe(({ connection }) => {
        if (this.testThenSave) {
          this.testThenSave = false;
          this.persistConnection(connection);
        }
      });

    this.actions$
      .pipe(
        ofType(ConnectionsEffectActions.connectionCheckFailed),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.testThenSave = false;
      });

    this.actions$
      .pipe(ofType(ConnectionsEffectActions.connectionAdded), takeUntilDestroyed())
      .subscribe(({ connectionId }) => {
        if (connectionId !== this.pendingSaveConnectionId) {
          return;
        }
        this.broadcastAndClose();
      });

    this.actions$
      .pipe(
        ofType(ConnectionsEffectActions.failedToAddConnection),
        takeUntilDestroyed(),
      )
      .subscribe(({ connectionId, error }) => {
        if (connectionId !== this.pendingSaveConnectionId) {
          return;
        }
        this.pendingSaveConnectionId = null;
        this.saveError.set(error);
      });
  }

  testConnection(): void {
    this.testThenSave = false;
    this.dispatchCheck();
  }

  testAndSave(): void {
    this.testThenSave = true;
    this.dispatchCheck();
  }

  saveWithoutTesting(): void {
    const connection = this.connection();
    if (!connection) {
      return;
    }
    this.persistConnection(connection);
  }

  cancel(): void {
    window.close();
  }

  private dispatchCheck(): void {
    const connection = this.connection();
    if (!connection) {
      return;
    }
    this.store.dispatch(ConnectionsActions.checkConnection({ connection }));
  }

  private persistConnection(connection: Connection): void {
    this.saveError.set(null);
    this.pendingSaveConnectionId = connection.id;
    this.store.dispatch(ConnectionsActions.addConnection({ connection }));
  }

  private broadcastAndClose(): void {
    const message: ConnectionsBroadcastMessage = {
      type: 'connection-added',
      name: this.connectionName() ?? '',
    };
    const channel = new BroadcastChannel('connections');
    channel.postMessage(message);
    channel.close();
    window.close();
  }
}
