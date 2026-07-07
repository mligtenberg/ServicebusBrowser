import { DIALOG_DATA } from '@angular/cdk/dialog';
import { CdkPortalOutlet, ComponentPortal } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  inject,
  Injector,
} from '@angular/core';
import { SbbDialogRef } from './dialog-ref';
import { SbbDialogInternalData } from './dialog.models';

/**
 * Internal chrome for `SbbDialogService` dialogs: a themed surface with an
 * optional header (title + close button) wrapping the caller's content
 * component, which is projected through a CDK portal outlet.
 *
 * The content component is created with an injector that provides the
 * dialog's `SbbDialogRef`, so it can `inject(SbbDialogRef)` and close itself
 * — matching the previous `DynamicDialogRef` pattern. Configured `inputs`
 * are applied once the content is attached.
 *
 * Not exported from the library barrel; instantiated only by
 * `SbbDialogService`.
 */
@Component({
  selector: 'sbb-dialog-container',
  standalone: true,
  imports: [CdkPortalOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dialog-container.component.html',
  styleUrl: './dialog-container.component.scss',
})
export class SbbDialogContainer {
  private readonly data = inject<SbbDialogInternalData>(DIALOG_DATA);

  protected readonly title = this.data.title;
  protected readonly closable = this.data.closable;
  protected readonly portal: ComponentPortal<unknown>;

  constructor() {
    const injector = Injector.create({
      parent: inject(Injector),
      providers: [{ provide: SbbDialogRef, useValue: this.data.ref }],
    });
    this.portal = new ComponentPortal(this.data.component, null, injector);
  }

  protected onAttached(ref: ComponentRef<unknown>): void {
    for (const [name, value] of Object.entries(this.data.inputs ?? {})) {
      ref.setInput(name, value);
    }
  }

  protected close(): void {
    this.data.ref.close(undefined);
  }
}
