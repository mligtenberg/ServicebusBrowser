import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SbbToastService } from './toast.service';

/**
 * Internal presentation for `SbbToastService`: renders the service's live
 * toast queue as a vertical stack, each with severity styling and a manual
 * dismiss button. Attached once to a global CDK overlay by the service;
 * never used directly by feature code.
 */
@Component({
  selector: 'sbb-toast-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.scss',
})
export class SbbToastContainer {
  private readonly service = inject(SbbToastService);

  protected readonly toasts = this.service.toasts;

  protected dismiss(id: number): void {
    this.service.dismiss(id);
  }
}
