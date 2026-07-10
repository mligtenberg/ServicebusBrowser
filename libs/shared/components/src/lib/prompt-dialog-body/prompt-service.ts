import { inject, Injectable } from '@angular/core';
import { PromptDialogBody } from './prompt-dialog-body';
import { SbbDialogService } from '@service-bus-browser/shared-ui';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PromptService {
  dialogService = inject(SbbDialogService);

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
    const dialog = this.dialogService.open<PromptDialogBody, string>(PromptDialogBody, {
      title: title,
      closable: true,
      inputs: {
        message: options.message,
        value: options.initialValue ?? '',
        okLabel: options.okLabel ?? 'confirm',
        cancelLabel: options.cancelLabel ?? 'cancel',
      },
    });

    const result = await firstValueFrom(dialog.closed);
    return typeof result === 'string' ? result : undefined;
  }
}
