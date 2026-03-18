import { Component, computed, effect, model } from '@angular/core';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { Connection } from '@service-bus-browser/api-contracts';

type RabbitMqConnection = Extract<Connection, { target: 'rabbitmq' }>;

@Component({
  selector: 'lib-rabbitmq-connection-target',
  imports: [FloatLabel, InputText, FormsModule],
  templateUrl: './rabbitmq-connection-target.component.html',
  styleUrl: './rabbitmq-connection-target.component.scss',
})
export class RabbitmqConnectionTargetComponent {
  connectionName = model<string>();
  connection = model<Connection | undefined>();
  host = model<string>();
  managementPort = model<number>();
  amqpPort = model<number>();
  userName = model<string>();
  password = model<string>();

  private resolvedConnection = computed<RabbitMqConnection | undefined>(() => {
    const name = this.connectionName();
    const host = this.host();
    const managementPort = this.managementPort();
    const amqpPort = this.amqpPort();
    const userName = this.userName();
    const password = this.password();

    return !name ||
      !host ||
      !managementPort ||
      !amqpPort ||
      !userName ||
      !password
      ? undefined
      : {
          id: crypto.randomUUID(),
          name,
          type: 'connectionString',
          host,
          managementPort,
          amqpPort,
          userName,
          password,
          target: 'rabbitmq',
        };
  });

  constructor() {
    effect(() => {
      this.connection.set(this.resolvedConnection());
    });

    effect(() => {
      const host = this.host();
      if (!this.connectionName() && !!host) {
        this.connectionName.set(host);
      }
    });
  }
}
