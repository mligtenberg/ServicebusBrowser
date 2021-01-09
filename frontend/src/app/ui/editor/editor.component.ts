import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { editor } from 'monaco-editor';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class EditorComponent implements OnInit {
  @ViewChild("editorContainer", { static: true })
  templateRef: ElementRef;

  constructor() { }

  ngOnInit(): void {
    editor.create(this.templateRef.nativeElement, {
      value: '',
      theme: 'vs-light',
    });
  }

}
