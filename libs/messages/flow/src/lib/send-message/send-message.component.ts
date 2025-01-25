import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorComponent } from 'ngx-monaco-editor-v2';
import { ColorThemeService } from '@service-bus-browser/services';
import { Card } from 'primeng/card';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CustomPropertyGroup, SendMessagesForm, SystemPropertyGroup } from './form';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FloatLabel } from 'primeng/floatlabel';

@Component({
  selector: 'lib-send-message',
  imports: [
    CommonModule,
    EditorComponent,
    Card,
    ReactiveFormsModule,
    AutoCompleteModule,
    FloatLabel,
  ],
  templateUrl: './send-message.component.html',
  styleUrl: './send-message.component.scss',
})
export class SendMessageComponent {
  colorThemeService = inject(ColorThemeService);
  form = new FormGroup<SendMessagesForm>({
    body: new FormControl<string>('', {
      nonNullable: true,
    }),
    contentType: new FormControl(''),
    properties: new FormArray<FormGroup<SystemPropertyGroup>>([]),
    customProperties: new FormArray<FormGroup<CustomPropertyGroup>>([]),
  });

  contentTypeSuggestions = computed(() => {
    if (this.contentTypeSearch() === null) {
      return [];
    }

    const contentTypes = [
      'application/json',
      'application/xml',
      'application/yaml',
      'application/ini',
      'application/toml',
      'text/plain',
    ];

    return contentTypes.filter((ct) =>
      ct.toLowerCase().includes((this.contentType() ?? '').toLowerCase())
    );
  });

  contentTypeSearch = signal<string | null>(null);
  contentType = toSignal(
    this.form.valueChanges.pipe(
      takeUntilDestroyed(),
      startWith(this.form.value),
      map((value) => value.contentType ?? '')
    )
  );
  bodyLanguage = computed(() => {
    const contentType = this.contentType() ?? '';

    if (contentType.includes('json')) {
      return 'json';
    }

    if (contentType.includes('xml')) {
      return 'xml';
    }

    if (contentType.includes('yaml') || contentType.includes('yml')) {
      return 'yaml';
    }

    if (contentType.includes('ini')) {
      return 'ini';
    }

    if (contentType.includes('toml')) {
      return 'TOML';
    }

    return 'text';
  });

  editorOptions = computed(() => ({
    theme: this.colorThemeService.lightMode() ? 'vs-light' : 'vs-dark',
    automaticLayout: true,
    language: this.bodyLanguage(),
    minimap: {
      enabled: false,
    },
  }));
}
