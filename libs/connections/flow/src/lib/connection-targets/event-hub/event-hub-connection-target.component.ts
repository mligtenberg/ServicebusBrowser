import { Component, computed, effect, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RadioButton } from 'primeng/radiobutton';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import {
  Connection,
  EventHubConnection,
} from '@service-bus-browser/api-contracts';

@Component({
  selector: 'lib-event-hub-connection-target',
  imports: [CommonModule, RadioButton, FloatLabel, InputText, FormsModule],
  templateUrl: './event-hub-connection-target.component.html',
  styleUrl: './event-hub-connection-target.component.scss',
})
export class EventHubConnectionTargetComponent {
  connectionName = model<string>();
  connection = model<Connection | undefined>();
  connectionType = model<'connectionString' | 'azureAD'>('connectionString');
  connectionString = model<string>();

  fullyQualifiedNamespace = model<string>();
  authMethod = model<
    | 'azureCli'
    | 'ServicePrincipalClientSecret'
    | 'systemAssignedManagedIdentity'
    | 'userAssignedManagedIdentity'
  >('azureCli');

  clientId = model<string>();
  clientSecret = model<string>();
  tenantId = model<string>();
  authority = model<string>();

  private resolvedConnection = computed<EventHubConnection | undefined>(() => {
    const connectionType = this.connectionType();
    const name = this.connectionName();
    if (connectionType === undefined || name === undefined) {
      return undefined;
    }

    if (connectionType === 'connectionString') {
      const connectionString = this.connectionString();
      return !connectionString
        ? undefined
        : {
            id: crypto.randomUUID(),
            name,
            connectionString,
            type: 'connectionString',
            target: 'eventHub',
          };
    }

    const fullyQualifiedNamespace = this.fullyQualifiedNamespace();
    const authMethod = this.authMethod();
    if (!fullyQualifiedNamespace || !authMethod) {
      return undefined;
    }

    if (authMethod === 'azureCli') {
      return {
        id: crypto.randomUUID(),
        name,
        type: 'azureAD',
        fullyQualifiedNamespace,
        authMethod: 'azureCli',
        target: 'eventHub',
      };
    }

    if (authMethod === 'ServicePrincipalClientSecret') {
      const clientId = this.clientId();
      const clientSecret = this.clientSecret();
      const tenantId = this.tenantId();
      const authority = this.authority();

      return !clientId || !clientSecret || !tenantId || !authority
        ? undefined
        : {
            id: crypto.randomUUID(),
            name,
            type: 'azureAD',
            fullyQualifiedNamespace,
            authMethod: 'ServicePrincipalClientSecret',
            clientId,
            clientSecret,
            tenantId,
            authority,
            target: 'eventHub',
          };
    }

    if (authMethod === 'systemAssignedManagedIdentity') {
      return {
        id: crypto.randomUUID(),
        name,
        type: 'azureAD',
        fullyQualifiedNamespace,
        authMethod: 'systemAssignedManagedIdentity',
        target: 'eventHub',
      };
    }

    const clientId = this.clientId();
    return !clientId
      ? undefined
      : {
          id: crypto.randomUUID(),
          name,
          type: 'azureAD',
          fullyQualifiedNamespace,
          authMethod: 'userAssignedManagedIdentity',
          clientId,
          target: 'eventHub',
        };
  });

  constructor() {
    effect(() => {
      this.connection.set(this.resolvedConnection());
    });

    effect(() => {
      const connectionType = this.connectionType();

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
        if (
          !!namespace &&
          (!this.connectionName() ||
            this.connectionName() === namespace.slice(0, namespace.length - 1))
        ) {
          this.connectionName.set(namespace.split('.')[0]);
        }
      }
    });
  }
}
