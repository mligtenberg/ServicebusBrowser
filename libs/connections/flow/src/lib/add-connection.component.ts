import { Component, computed, effect, inject, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RadioButton } from 'primeng/radiobutton';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ConnectionsActions, ConnectionsSelectors } from '@service-bus-browser/connections-store';
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

  // Select connection test status from store
  connectionTestStatus$ = this.store.select(ConnectionsSelectors.selectConnectionTestStatus);
  connectionTested$ = this.store.select(ConnectionsSelectors.selectConnectionTested);

  connectionName = model<string>();
  connectionType = model<'connectionString' | 'azureAD'>('connectionString');
  connectionString = model<string>();

  // Azure AD connection properties
  fullyQualifiedNamespace = model<string>();
  authMethod = model<'azureCli' | 'ServicePrincipalClientSecret' | 'systemAssignedManagedIdentity' | 'userAssignedManagedIdentity'>('azureCli');

  // Service Principal properties
  clientId = model<string>();
  clientSecret = model<string>();
  tenantId = model<string>();
  authority = model<string>();

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
      const fullyQualifiedNamespace = this.fullyQualifiedNamespace();
      const authMethod = this.authMethod();

      if (!fullyQualifiedNamespace || !authMethod) {
        return undefined;
      }

      if (authMethod === 'azureCli') {
        return {
          id: crypto.randomUUID(),
          name: name,
          type: 'azureAD',
          fullyQualifiedNamespace: fullyQualifiedNamespace,
          authMethod: 'azureCli',
        };
      }

      if (authMethod === 'ServicePrincipalClientSecret') {
        const clientId = this.clientId();
        const clientSecret = this.clientSecret();
        const tenantId = this.tenantId();
        const authority = this.authority();

        return !clientId || !clientSecret || !tenantId || !authority ? undefined : {
          id: crypto.randomUUID(),
          name: name,
          type: 'azureAD',
          fullyQualifiedNamespace: fullyQualifiedNamespace,
          authMethod: 'ServicePrincipalClientSecret',
          clientId: clientId,
          clientSecret: clientSecret,
          tenantId: tenantId,
          authority: authority,
        };
      }

      if (authMethod === 'systemAssignedManagedIdentity') {
        return {
          id: crypto.randomUUID(),
          name: name,
          type: 'azureAD',
          fullyQualifiedNamespace: fullyQualifiedNamespace,
          authMethod: 'systemAssignedManagedIdentity',
        };
      }

      if (authMethod === 'userAssignedManagedIdentity') {
        const clientId = this.clientId();

        return !clientId ? undefined : {
          id: crypto.randomUUID(),
          name: name,
          type: 'azureAD',
          fullyQualifiedNamespace: fullyQualifiedNamespace,
          authMethod: 'userAssignedManagedIdentity',
          clientId: clientId,
        };
      }
    }

    return undefined;
  });

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
    this.connectionTested$.subscribe(tested => {
      this._connectionTested = tested;
    });

    // Reset connection test when connection changes
    effect(() => {
      // This effect will run whenever the connection computed property changes
      this.connection();
      this.store.dispatch(ConnectionsActions.resetConnectionTest());
    });

    effect(() => {
      const connectionType = this.connectionType();

      // Clear fields based on connection type
      if (connectionType !== 'connectionString') {
        this.connectionString.set(undefined);
      }

      if (connectionType !== 'azureAD') {
        this.fullyQualifiedNamespace.set(undefined);
        this.authMethod.set('azureCli');
        this.clientId.set(undefined);
        this.clientSecret.set(undefined);
        this.tenantId.set(undefined);
        this.authority.set(undefined);
      }

      // Auto-fill connection name from connection string if possible
      if (connectionType === 'connectionString') {
        const connectionString = this.connectionString();
        if (!this.connectionName() && !!connectionString) {
          const capture = /.*Endpoint=sb:\/\/([a-z1-9-.]*)\/?;.*/i.exec(connectionString);
          if (capture?.[1]) {
            this.connectionName.set(capture[1]);
          }
        }
      }

      // Auto-fill connection name from namespace if possible
      if (connectionType === 'azureAD') {
        const namespace = this.fullyQualifiedNamespace();
        if (!!namespace && (!this.connectionName() || this.connectionName() === namespace.slice(0, namespace.length - 1))) {
          this.connectionName.set(namespace.split('.')[0]);
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
