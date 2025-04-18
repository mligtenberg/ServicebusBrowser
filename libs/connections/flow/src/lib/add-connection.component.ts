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
  connectionType = model<'connectionString' | 'azureAD'>('connectionString');
  connectionString = model<string>();
  fullyQualifiedNamespace = model<string>();
  authMethod = model<'currentUser' | 'systemAssignedManagedIdentity' | 'userAssignedManagedIdentity'>('currentUser');
  clientId = model<string>();
  email = model<string>();

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
    
    if (connectionType === 'azureAD') {
      const namespace = this.fullyQualifiedNamespace();
      const authMethod = this.authMethod();
      
      if (!namespace || !authMethod) {
        return undefined;
      }
      
      // For user-assigned managed identity, client ID is required
      if (authMethod === 'userAssignedManagedIdentity' && !this.clientId()) {
        return undefined;
      }
      
      return {
        id: crypto.randomUUID(),
        name: name,
        fullyQualifiedNamespace: namespace,
        type: 'azureAD',
        authMethod: authMethod,
        clientId: authMethod === 'userAssignedManagedIdentity' ? this.clientId() : undefined,
        email: authMethod === 'currentUser' ? this.email() || undefined : undefined,
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
      }
      
      if (connectionType !== 'azureAD') {
        this.fullyQualifiedNamespace.set(undefined);
        this.authMethod.set('currentUser');
        this.clientId.set(undefined);
        this.email.set(undefined);
      }
      
      if (connectionType === 'connectionString') {
        const connectionString = this.connectionString();
        if (!this.connectionName() && !!connectionString) {
          const capture = /.*Endpoint=sb:\/\/([a-z1-9-.]*)\/?;.*/i.exec(connectionString);
          if (capture?.[1]) {
            this.connectionName.set(capture[1]);
          }
        }
      }
      
      if (connectionType === 'azureAD') {
        const namespace = this.fullyQualifiedNamespace();
        if (!this.connectionName() && !!namespace) {
          this.connectionName.set(namespace.split('.')[0]);
        }
      }
      
      // Clear client ID if not using user-assigned managed identity
      if (this.authMethod() !== 'userAssignedManagedIdentity') {
        this.clientId.set(undefined);
      }
      
      // Clear email if not using current user authentication
      if (this.authMethod() !== 'currentUser') {
        this.email.set(undefined);
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
