import { Component, computed, effect, inject, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import {
  ConnectionsActions,
  ConnectionsSelectors,
} from '@service-bus-browser/connections-store';
import { ButtonDirective } from 'primeng/button';
import {
  Connection,
  MessageQueueTargetType,
} from '@service-bus-browser/api-contracts';
import { Select } from 'primeng/select';
import { ServiceBusConnectionTargetComponent } from './connection-targets/service-bus/service-bus-connection-target.component';
import { RabbitmqConnectionTargetComponent } from './connection-targets/rabbitmq/rabbitmq-connection-target.component';

@Component({
  selector: 'lib-add-connection',
  imports: [
    CommonModule,
    FloatLabel,
    InputText,
    FormsModule,
    ButtonDirective,
    Select,
    ServiceBusConnectionTargetComponent,
    RabbitmqConnectionTargetComponent,
  ],
  templateUrl: './add-connection.component.html',
  styleUrl: './add-connection.component.scss',
})
export class AddConnectionComponent {
  store = inject(Store);

  // Select connection test status from store
  connectionTestStatus$ = this.store.select(
    ConnectionsSelectors.selectConnectionTestStatus,
  );
  connectionTested$ = this.store.select(
    ConnectionsSelectors.selectConnectionTested,
  );

  connectionName = model<string>();
  connectionTarget = model<MessageQueueTargetType>('serviceBus');
  connectionTargets: Array<{ label: string; value: MessageQueueTargetType }> = [
    { label: 'Service Bus', value: 'serviceBus' },
    { label: 'RabbitMQ', value: 'rabbitmq' },
  ];
  connection = model<Connection | undefined>();

  canTest = computed(() => {
    return this.connection() !== undefined;
  });

  canSave = computed(() => {
    // We need to use a local variable to track the connection tested state
    // since we can't directly use an observable in a computed property
    const connection = this.connection();
    return connection !== undefined && this._connectionTested;
  });

  // Private property to track connection tested state
  private _connectionTested = false;

  constructor() {
    // Subscribe to connection tested state from store
    this.connectionTested$.subscribe((tested) => {
      this._connectionTested = tested;
    });

    // Reset connection test when connection changes
    effect(() => {
      // This effect will run whenever the connection computed property changes
      this.connection();
      this.store.dispatch(ConnectionsActions.resetConnectionTest());
    });

    effect(() => {
      this.connectionTarget();
      this.connection.set(undefined);
    });
  }

  testConnection() {
    const connection = this.connection();
    if (!connection) {
      return;
    }

    this.store.dispatch(
      ConnectionsActions.checkConnection({
        connection,
      }),
    );
  }

  save() {
    const connection = this.connection();
    if (!connection) {
      return;
    }

    this.store.dispatch(
      ConnectionsActions.addConnection({
        connection: connection,
      }),
    );
  }
}
