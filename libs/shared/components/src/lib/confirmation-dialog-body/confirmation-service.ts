import { inject, Injectable } from '@angular/core';
import { ConfirmationDialogBody } from './confirmation-dialog-body';
import { DialogService } from 'primeng/dynamicdialog';
import { lastValueFrom, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationService {
  dialogService = inject(DialogService);

  async confirm(title: string, message: string, okLabel = 'confirm', cancelLabel = 'cancel') {
    const dialog = this.dialogService.open(ConfirmationDialogBody, {
      header: title,
      closable: true,
      inputValues: {
        message: message,
        okLabel: okLabel,
        cancelLabel: cancelLabel,
      }
    });

    if (!dialog) {
      return;
    }

    const result = await lastValueFrom(dialog.onClose.pipe(take(1)));
    console.log(result);
    return !!result;
  }
}
