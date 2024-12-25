import { Component, computed, effect, inject, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RadioButton } from 'primeng/radiobutton';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ConnectionsActions } from '@service-bus-browser/connections-store';
import { ButtonDirective } from 'primeng/button';
import { Connection } from '@service-bus-browser/service-bus-contracts';

@Component({
  selector: 'lib-add-connection',
  imports: [
    CommonModule,
    RadioButton,
    FloatLabel,
    InputText,
    FormsModule,
    ButtonDirective,
  ],
  templateUrl: './add-connection.component.html',
  styleUrl: './add-connection.component.scss',
})
export class AddConnectionComponent {
  store = inject(Store);

  connectionName = model<string>();
  connectionType = model<'connectionString'>('connectionString');
  connectionString = model<string>();

  connection = computed<Connection | undefined>(() => {
    const connectionType = this.connectionType();
    const name = this.connectionName();
    if (connectionType === undefined || name === undefined) {
      return undefined;
    }

    if (connectionType === 'connectionString') {
      const connectionString = this.connectionString();

      return !connectionString ? undefined : {
        id: crypto.randomUUID(),
        name: name,
        connectionString: connectionString,
        type: 'connectionString',
      };
    }

    return undefined;
  });

  canSave = computed(() => {
    return this.connection() !== undefined;
  });

  constructor() {
    effect(() => {
      const connectionType = this.connectionType();
      if (connectionType !== 'connectionString') {
        this.connectionString.set(undefined);
        return;
      }

      const connectionString = this.connectionString();
      if (!this.connectionName() && !!connectionString) {
        const capture = /.*Endpoint=sb:\/\/([a-z1-9-.]*)\/?;.*/i.exec(connectionString);
        if (capture?.[1]) {
          this.connectionName.set(capture[1]);
        }
      }
    });
  }

  testConnection() {
    const connection = this.connection();
    if (!connection) {
      return;
    }

    this.store.dispatch(ConnectionsActions.checkConnection({
      connection
    }))
  }

  save() {
    const connection = this.connection();
    if (!connection) {
      return;
    }

    this.store.dispatch(
      ConnectionsActions.addConnection({
        connection: connection
      })
    );
  }
}
