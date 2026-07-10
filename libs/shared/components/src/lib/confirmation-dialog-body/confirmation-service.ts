import { inject, Injectable } from '@angular/core';
import { ConfirmationDialogBody } from './confirmation-dialog-body';
import { SbbDialogService } from '@service-bus-browser/shared-ui';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationService {
  dialogService = inject(SbbDialogService);

  async confirm(title: string, message: string, okLabel = 'confirm', cancelLabel = 'cancel') {
    const dialog = this.dialogService.open<ConfirmationDialogBody, boolean>(ConfirmationDialogBody, {
      title: title,
      closable: true,
      inputs: {
        message: message,
        okLabel: okLabel,
        cancelLabel: cancelLabel,
      }
    });

    const result = await firstValueFrom(dialog.closed);
    return !!result;
  }
}
