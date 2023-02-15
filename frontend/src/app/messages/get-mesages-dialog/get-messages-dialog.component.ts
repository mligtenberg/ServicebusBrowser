import { Component } from '@angular/core';
import { DialogRef } from 'src/app/ui/dialog.service';
import { GetMessagesDialogResponseModel } from './get-messages-dialog-response.model';
import Long from 'long';

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
        this.dialogRef.respond({
            amountOfMessagesToRetrieve: this.amountOfMessagesToRetrieve,
            skip: this.skip,
            fromSequenceNumber: Long.fromNumber(this.fromSequenceNumber),
        });
    }
}
