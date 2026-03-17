import { Component, inject, input } from '@angular/core';
import { Button } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'sbb-confirmation-dialog-body',
  imports: [Button],
  templateUrl: './confirmation-dialog-body.html',
  styleUrl: './confirmation-dialog-body.scss',
})
export class ConfirmationDialogBody {
  dialogRef = inject(DynamicDialogRef);

  message = input.required<string>();
  okLabel = input('confirm');
  cancelLabel = input('cancel');

  confirm() {
    this.dialogRef.close(true);
  }
  cancel() {
    this.dialogRef.close(false);
  }
}
