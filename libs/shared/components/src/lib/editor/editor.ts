import {
  Component,
  effect,
  ElementRef, inject, InjectionToken,
  input,
  model,
  OnDestroy,
  viewChild,
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';

import * as monaco from 'monaco-editor';
import { toObservable } from '@angular/core/rxjs-interop';
const MONACO_CONFIG = new InjectionToken<{
  urlPrefix?: string;
}>('monaco configuration');

export function provideMonacoConfig(config: { urlPrefix?: string }) {
  return {
    provide: MONACO_CONFIG,
    useValue: config,
  };
}

@Component({
  selector: 'sbb-editor',
  imports: [],
  templateUrl: './editor.html',
  styleUrl: './editor.scss',
})
export class Editor implements OnDestroy, FormValueControl<string> {
  editorRef = viewChild<ElementRef<HTMLDivElement>>('editor');
  editorOptions =
    input.required<monaco.editor.IStandaloneEditorConstructionOptions>();
  editor: monaco.editor.IStandaloneCodeEditor | undefined;
  value = model<string>('');
  monacoConfig = inject(MONACO_CONFIG);

  private value$ = toObservable(this.value);
  private editorOptions$ = toObservable(this.editorOptions);

  constructor() {
    this.setupMonacoEnvironment();

    effect(() => {
      if (this.editor) {
        this.editor.dispose();
      }

      const editorRef = this.editorRef()?.nativeElement;
      if (!editorRef) {
        return;
      }

      this.editor = monaco.editor.create(editorRef, {
        ...this.editorOptions(),
        value: this.value(),
      });

      this.editor.onDidBlurEditorText((event) => {
        const newValue = this.editor?.getValue();
        this.value.set(newValue ?? '');
      });
    });

    effect(() => {
      const newValue = this.value();
      if (this.editor) {
        const currentValue = this.editor.getValue();
        if (newValue !== currentValue) {
          this.editor.setValue(newValue);
        }
      }
    });
  }

  setupMonacoEnvironment() {
    if (window.MonacoEnvironment) {
      return;
    }

    const urlPrefix = this.monacoConfig.urlPrefix ?? '';
    window.MonacoEnvironment = {
      getWorkerUrl: function (moduleId, label) {
        if (label === 'json') {
          return urlPrefix + '/vs/language/json/json.worker.js';
        }
        if (label === 'css' || label === 'scss' || label === 'less') {
          return urlPrefix + '/vs/language/css/css.worker.js';
        }
        if (label === 'html' || label === 'handlebars' || label === 'razor') {
          return urlPrefix + '/vs/language/html/html.worker.js';
        }
        if (label === 'typescript' || label === 'javascript') {
          return urlPrefix + '/vs/language/typescript/ts.worker.js';
        }
        return urlPrefix + '/vs/editor/editor.worker.js';
      },
    };
  }

  ngOnDestroy(): void {
    this.editor?.dispose();
    this.editor = undefined;
  }
}
