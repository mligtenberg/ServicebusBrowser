import { inject, Injectable } from '@angular/core';
import { PromptDialogBody } from './prompt-dialog-body';
import { DialogService } from 'primeng/dynamicdialog';
import { lastValueFrom, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PromptService {
  dialogService = inject(DialogService);

  /**
   * Opens a dialog asking the user for a single line of text.
   * Resolves with the trimmed value, or `undefined` if cancelled.
   */
  async prompt(
    title: string,
    options: {
      message?: string;
      initialValue?: string;
      okLabel?: string;
      cancelLabel?: string;
    } = {},
  ): Promise<string | undefined> {
    const dialog = this.dialogService.open(PromptDialogBody, {
      header: title,
      closable: true,
      inputValues: {
        message: options.message,
        value: options.initialValue ?? '',
        okLabel: options.okLabel ?? 'confirm',
        cancelLabel: options.cancelLabel ?? 'cancel',
      },
    });

    if (!dialog) {
      return undefined;
    }

    const result = await lastValueFrom(dialog.onClose.pipe(take(1)));
    return typeof result === 'string' ? result : undefined;
  }
}
