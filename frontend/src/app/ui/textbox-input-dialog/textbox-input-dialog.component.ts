import { Component, Inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

@Component({
    selector: 'app-textbox-input-dialog',
    templateUrl: './textbox-input-dialog.component.html',
    styleUrls: ['./textbox-input-dialog.component.scss'],
})
export class TextboxInputDialogComponent {
    text: string;
    editorOptions = { theme: 'vs-light', language: 'text/plain' };

    constructor(public dialogRef: DialogRef<string>, @Inject(DIALOG_DATA) public data: string) {
        this.text = data;
    }

    submit(): void {
        this.dialogRef.close(this.text);
    }

    cancel(): void {
        this.dialogRef.close();
    }
}
