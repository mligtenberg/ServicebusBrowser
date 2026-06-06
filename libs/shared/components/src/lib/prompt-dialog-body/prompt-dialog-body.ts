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
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'sbb-prompt-dialog-body',
  imports: [Button, InputText, FormsModule],
  templateUrl: './prompt-dialog-body.html',
  styleUrl: './prompt-dialog-body.scss',
})
export class PromptDialogBody {
  dialogRef = inject(DynamicDialogRef);

  input = viewChild<ElementRef<HTMLInputElement>>('input');

  message = input<string>();
  okLabel = input('confirm');
  cancelLabel = input('cancel');
  value = model<string>('');

  constructor() {
    afterNextRender(() => {
      const input = this.input()?.nativeElement;
      input?.focus();
      input?.select();
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
