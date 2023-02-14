import { Component } from '@angular/core';
import { DialogRef } from 'src/app/ui/dialog.service';

@Component({
    selector: 'app-get-mesages-dialog',
    templateUrl: './get-mesages-dialog.component.html',
    styleUrls: ['./get-mesages-dialog.component.scss'],
})
export class GetMesagesDialogComponent {
    amountOfMessagesToRetrieve: number = 10;

    constructor(private dialogRef: DialogRef<number>) {}

    retrieve() {
        this.dialogRef.respond(this.amountOfMessagesToRetrieve);
    }
}
