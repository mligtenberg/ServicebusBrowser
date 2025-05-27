import { Component, effect, input, model, output, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Action,
  AlterAction,
  BatchActionTarget,
  MessageFilter
} from '@service-bus-browser/messages-contracts';
import { FormsModule } from '@angular/forms';
import { AlterBodyComponent } from './components/alter-body/alter-body.component';
import { AlterSystemPropertiesComponent } from './components/alter-system-properties/alter-system-properties.component';
import { AlterApplicationPropertiesComponent } from './components/alter-application-properties/alter-application-properties.component';
import { ActionComponent } from '../action/action.component';

@Component({
  selector: 'lib-alter-action-body',
  imports: [
    CommonModule,
    FormsModule,
    AlterBodyComponent,
    AlterSystemPropertiesComponent,
    AlterApplicationPropertiesComponent
  ],
  templateUrl: './alter-action-body.component.html',
  styleUrl: './alter-action-body.component.scss',
})
export class AlterActionBodyComponent {
  target = input.required<BatchActionTarget>();
  messageFilter = input.required<MessageFilter>();
  action = input<Action>();
  alterActionUpdated = output<AlterAction | undefined>();

  protected alterAction = model<AlterAction | undefined>();

  constructor() {
    effect(() => {
      this.alterActionUpdated.emit(this.alterAction());
    });
  }

  onAlterActionUpdated(action: AlterAction | undefined) {
    if (action) {
      // Add the filters to the action
      action.applyOnFilter = this.messageFilter();
    }
    this.alterAction.set(action);
  }
}
