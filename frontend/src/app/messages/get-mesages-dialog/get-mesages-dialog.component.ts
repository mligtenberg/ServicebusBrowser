import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogRef } from 'src/app/ui/dialogRef';

@Component({
  selector: 'app-get-mesages-dialog',
  templateUrl: './get-mesages-dialog.component.html',
  styleUrls: ['./get-mesages-dialog.component.scss']
})
export class GetMesagesDialogComponent {
  amountOfMessagesToRetreive: number = 10;

  constructor(private dialogRef: DialogRef<number>) {}
  
  retreive() {
    this.dialogRef.respond(this.amountOfMessagesToRetreive);
  }
}
