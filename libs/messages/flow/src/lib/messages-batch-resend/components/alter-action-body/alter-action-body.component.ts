import { Component, computed, effect, inject, input, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AlterAction,
  AlterType,
  BatchActionTarget,
  MessageFilter
} from '@service-bus-browser/messages-contracts';
import { Button } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { InputGroup } from 'primeng/inputgroup';
import { InputText } from 'primeng/inputtext';
import { Popover } from 'primeng/popover';
import { Select } from 'primeng/select';
import { Checkbox } from 'primeng/checkbox';
import { AlterBodyComponent } from './components/alter-body/alter-body.component';
import { AlterSystemPropertiesComponent } from './components/alter-system-properties/alter-system-properties.component';
import { AlterApplicationPropertiesComponent } from './components/alter-application-properties/alter-application-properties.component';

@Component({
  selector: 'lib-alter-action-body',
  imports: [
    CommonModule,
    Button,
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
