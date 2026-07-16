import {
  afterNextRender,
  Component,
  ElementRef,
  inject,
  input,
  model,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SbbButton, SbbDialogRef, SbbInput } from '@service-bus-browser/shared-ui';

@Component({
  selector: 'sbb-prompt-dialog-body',
  imports: [SbbButton, SbbInput, FormsModule],
  templateUrl: './prompt-dialog-body.html',
  styleUrl: './prompt-dialog-body.scss',
})
export class PromptDialogBody {
  dialogRef = inject<SbbDialogRef<string>>(SbbDialogRef);

  // `SbbInput` is a component, not a plain `<input>`, so a template reference
  // on it resolves to the `SbbInput` instance; `{ read: ElementRef }` grabs
  // its host element instead so we can reach the native `<input>` it wraps
  // for autofocus/select-on-open (`SbbInput` doesn't expose a `focus()`
  // method of its own — see report).
  private readonly inputHost = viewChild('input', { read: ElementRef });

  message = input<string>();
  okLabel = input('confirm');
  cancelLabel = input('cancel');
  value = model<string>('');

  constructor() {
    afterNextRender(() => {
      const nativeInput = this.inputHost()?.nativeElement.querySelector('input');
      nativeInput?.focus();
      nativeInput?.select();
    });
  }

  confirm() {
    const value = this.value().trim();
    if (!value) {
      return;
    }
    this.dialogRef.close(value);
  }

  cancel() {
    this.dialogRef.close(undefined);
  }
}
