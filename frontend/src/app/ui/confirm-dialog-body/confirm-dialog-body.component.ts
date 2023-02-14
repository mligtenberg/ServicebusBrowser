import { Component, OnInit } from '@angular/core';
import { DialogRef } from '../models/dialogRef';
import { DialogOptions } from '../models/dialogOptions';

@Component({
    selector: 'app-confirm-dialog-body',
    templateUrl: './confirm-dialog-body.component.html',
    styleUrls: ['./confirm-dialog-body.component.scss'],
})
export class ConfirmDialogBodyComponent implements OnInit {
    title: string;
    message: string;

    constructor(private dialogRef: DialogRef<boolean>, private options: DialogOptions) {}

    confirm() {
        this.dialogRef.respond(true);
    }

    cancel() {
        this.dialogRef.respond(false);
    }

    ngOnInit(): void {
        this.title = this.options.get('title');
        this.message = this.options.get('message');
    }
}
