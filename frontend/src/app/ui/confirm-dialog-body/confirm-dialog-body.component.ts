import { Component, Inject, OnInit } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

export interface ConfirmDialogOptions {
    title: string;
    message: string;
}

@Component({
    selector: 'app-confirm-dialog-body',
    templateUrl: './confirm-dialog-body.component.html',
    styleUrls: ['./confirm-dialog-body.component.scss'],
})
export class ConfirmDialogBodyComponent implements OnInit {
    title: string;
    message: string;

    constructor(public dialogRef: DialogRef<boolean>, @Inject(DIALOG_DATA) public data: ConfirmDialogOptions) {}

    confirm() {
        this.dialogRef.close(true);
    }

    cancel() {
        this.dialogRef.close(false);
    }

    ngOnInit(): void {
        this.title = this.data.title;
        this.message = this.data.message;
    }
}
