import { Component } from '@angular/core';
import { DialogRef } from '../dialog.service';
import { DialogOptions } from '../models/dialogOptions';

@Component({
  selector: 'app-textbox-input-dialog',
  templateUrl: './textbox-input-dialog.component.html',
  styleUrls: ['./textbox-input-dialog.component.scss'],
})
export class TextboxInputDialogComponent {
  text: string;
  editorOptions = { theme: 'vs-light', language: 'text/plain' };

  constructor(options: DialogOptions, private dialogRef: DialogRef<string>) {
    this.text = options.get("text");
  }

  submit() {
    this.dialogRef.respond(this.text);
  }

  cancel() {
    this.dialogRef.cancel();
  }
}
