import { Component, computed, effect, inject, input, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Action,
  AlterAction,
  AlterBodyAction, AlterBodyPartialReplaceAction,
  AlterType,
  PropertyValue
} from '@service-bus-browser/messages-contracts';
import { FormsModule } from '@angular/forms';
import { InputGroup } from 'primeng/inputgroup';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { EditorComponent } from 'ngx-monaco-editor-v2';
import { ColorThemeService } from '@service-bus-browser/services';

@Component({
  selector: 'lib-alter-body',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputText,
    Select,
    Textarea,
    Button,
    Dialog,
    EditorComponent
  ],
  templateUrl: './alter-body.component.html',
  styleUrls: ['./alter-body.component.scss']
})
export class AlterBodyComponent {
  alterActionUpdated = output<AlterAction | undefined>();

  action = input<Action>();
  protected alterType = model<AlterType>('fullReplace');
  protected value = model<string>('');
  protected searchValue = model<string>('');
  protected monacoDialogVisible = model<boolean>(false);

  private colorThemeService = inject(ColorThemeService);

  alterTypes = [
    { label: 'Full Replace', value: 'fullReplace' },
    { label: 'Search and Replace', value: 'searchAndReplace' },
    { label: 'Regex Replace', value: 'regexReplace' }
  ];

  editorOptions = computed(() => ({
    theme: this.colorThemeService.lightMode() ? 'vs-light' : 'vs-dark',
    automaticLayout: true,
    language: 'json', // Default to JSON - we could add detection based on content
    minimap: {
      enabled: false,
    },
  }));

  alterAction = computed<AlterBodyAction | undefined>(() => {
    const currentAlterType = this.alterType();
    const currentValue = this.value();

    if (!currentValue || currentValue === '') {
      return undefined;
    }

    if (currentAlterType === 'fullReplace') {
      return {
        type: 'alter',
        target: 'body',
        value: currentValue,
        alterType: 'fullReplace',
        applyOnFilter: { body: [], systemProperties: [], applicationProperties: [] }
      };
    } else {
      const currentSearchValue = this.searchValue();

      if (!currentSearchValue || currentSearchValue === '') {
        return undefined;
      }

      return {
        type: 'alter',
        target: 'body',
        searchValue: currentSearchValue,
        value: currentValue,
        alterType: currentAlterType,
        applyOnFilter: { body: [], systemProperties: [], applicationProperties: [] }
      };
    }
  });

  constructor() {
    effect(() => {
      this.alterActionUpdated.emit(this.alterAction());
    });

    effect(() => {
      const action = this.action() as Partial<AlterBodyAction> | undefined;
      if (!action) {
        return;
      }
      const partialReplaceAction = action as Partial<AlterBodyPartialReplaceAction>;

      if (action.value) {
        this.value.set(action.value);
      }

      if (partialReplaceAction.searchValue) {
        this.searchValue.set(partialReplaceAction.searchValue);
      }

      if (action.alterType) {
        this.alterType.set(action.alterType);
      }
    });
  }
}
