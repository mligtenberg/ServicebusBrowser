import { Component } from '@angular/core';
import { GetMessagesDialogResponseModel } from './get-messages-dialog-response.model';
import Long from 'long';
import { DialogRef } from '@angular/cdk/dialog';

@Component({
    selector: 'app-get-mesages-dialog',
    templateUrl: './get-messages-dialog.component.html',
    styleUrls: ['./get-messages-dialog.component.scss'],
})
export class GetMessagesDialogComponent {
    amountOfMessagesToRetrieve: number = 10;
    skip: number = 0;
    fromSequenceNumber: number = 0;

    constructor(private dialogRef: DialogRef<GetMessagesDialogResponseModel>) {}

    retrieve() {
        this.dialogRef.close({
            amountOfMessagesToRetrieve: this.amountOfMessagesToRetrieve,
            skip: this.skip,
            fromSequenceNumber: Long.fromNumber(this.fromSequenceNumber),
        });
    }
}
