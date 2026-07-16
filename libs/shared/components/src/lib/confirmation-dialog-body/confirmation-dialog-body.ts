import { Component, inject, input } from '@angular/core';
import { SbbButton, SbbDialogRef } from '@service-bus-browser/shared-ui';

@Component({
  selector: 'sbb-confirmation-dialog-body',
  imports: [SbbButton],
  templateUrl: './confirmation-dialog-body.html',
  styleUrl: './confirmation-dialog-body.scss',
})
export class ConfirmationDialogBody {
  dialogRef = inject<SbbDialogRef<boolean>>(SbbDialogRef);

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
