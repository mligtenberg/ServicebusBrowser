import { Component, computed, effect, inject, input, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  BatchActionTarget,
  MessageFilter, 
  RemoveAction, 
  SystemKeyProperty 
} from '@service-bus-browser/messages-contracts';
import { FormsModule } from '@angular/forms';
import { InputGroup } from 'primeng/inputgroup';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { SystemPropertyKeys } from '../../../send-message/form';

@Component({
  selector: 'lib-remove-action-body',
  imports: [
    CommonModule,
    FormsModule,
    InputGroup,
    InputText,
    Select,
  ],
  templateUrl: './remove-action-body.component.html',
  styleUrl: './remove-action-body.component.scss',
})
export class RemoveActionBodyComponent {
  target = input.required<Exclude<BatchActionTarget, 'body'>>();
  messageFilter = input.required<MessageFilter>();
  removeActionUpdated = output<RemoveAction | undefined>();
  
  protected applicationPropertyName = model<string>('');
  protected systemPropertyName = model<SystemKeyProperty | ''>('');
  
  systemPropertyKeys = SystemPropertyKeys;
  
  removeAction = computed<RemoveAction | undefined>(() => {
    const target = this.target();
    const fieldName =
      this.target() === 'applicationProperties'
        ? this.applicationPropertyName()
        : this.systemPropertyName();
        
    if (!fieldName || fieldName === '') {
      return undefined;
    }
    
    if (target === 'systemProperties') {
      return {
        type: 'remove',
        target: 'systemProperties',
        fieldName: fieldName as SystemKeyProperty,
        applyOnFilter: this.messageFilter(),
      };
    }
    
    return {
      type: 'remove',
      target: 'applicationProperties',
      fieldName: fieldName,
      applyOnFilter: this.messageFilter(),
    };
  });
  
  constructor() {
    effect(() => {
      this.removeActionUpdated.emit(this.removeAction());
    });
    
    effect(() => {
      this.target();
      this.applicationPropertyName.set('');
      this.systemPropertyName.set('');
    });
  }
}
