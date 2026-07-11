import {
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  output,
} from '@angular/core';

import {
  MessageModificationAction,
  AlterAction,
  AlterBodyAction,
  AlterBodyPartialReplaceAction,
  AlterType,
} from '@service-bus-browser/message-modification-engine';
import { FormsModule } from '@angular/forms';
import {
  SbbButton,
  SbbDialog,
  SbbInput,
  SbbInputGroup,
  SbbSelect,
  SbbTextarea,
  SbbTooltip,
} from '@service-bus-browser/shared-ui';
import { ColorThemeService } from '@service-bus-browser/services';
import { Editor } from '@service-bus-browser/shared-components';
import { faCheck, faUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'lib-alter-body',
  standalone: true,
  imports: [
    FormsModule,
    SbbInput,
    SbbSelect,
    SbbTextarea,
    SbbButton,
    SbbDialog,
    Editor,
    SbbInputGroup,
    SbbTooltip,
  ],
  templateUrl: './alter-body.component.html',
  styleUrls: ['./alter-body.component.scss'],
})
export class AlterBodyComponent {
  alterActionUpdated = output<AlterAction | undefined>();

  action = input<MessageModificationAction>();
  protected alterType = model<AlterType>('fullReplace');
  protected value = model<string>('');
  protected searchValue = model<string>('');
  protected monacoDialogVisible = model<boolean>(false);

  private colorThemeService = inject(ColorThemeService);

  alterTypes = [
    { label: 'Full Replace', value: 'fullReplace' },
    { label: 'Search and Replace', value: 'searchAndReplace' },
    { label: 'Regex Replace', value: 'regexReplace' },
  ];

  // Rich-content pTooltip (with <pre> capture-group examples) has no
  // equivalent in SbbTooltip, which only accepts a plain string. Collapsed to
  // an equivalent plain-text hint — see migration report for details.
  protected readonly regexHelpText =
    'Use named capture groups: (?<name>pattern). Reference the captured value in the replacement with $<name>';
  protected readonly externalLinkIcon = faUpRightFromSquare;
  protected readonly checkIcon = faCheck;

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
        applyOnFilter: {
          body: [],
          headers: [],
          properties: [],
          deliveryAnnotations: [],
          messageAnnotations: [],
          applicationProperties: [],
        },
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
        applyOnFilter: {
          body: [],
          headers: [],
          properties: [],
          deliveryAnnotations: [],
          messageAnnotations: [],
          applicationProperties: [],
        },
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
      const partialReplaceAction =
        action as Partial<AlterBodyPartialReplaceAction>;

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
