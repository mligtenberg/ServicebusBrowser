import {
  ApplicationRef,
  ComponentFactoryResolver,
  Injectable,
  Injector,
  Type
} from '@angular/core';
import { DialogComponent } from './dialog/dialog.component';
import { DialogOptions } from './models/dialogOptions';
import { DialogRef } from './models/dialogRef';
export { DialogRef };

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private openedDialog: DialogRef<any> | null = null;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector
  ) {}

  public openDialog<T, TResponse>(containerContent: Type<T>, options: DialogOptions = null): DialogRef<TResponse> {
    this.closeDialog();

    const dialogRef = this.componentFactoryResolver
      .resolveComponentFactory(DialogComponent)
      .create(this.injector);
      
    dialogRef.instance.componentType = containerContent;
    dialogRef.instance.options = options;

    this.appRef.attachView(dialogRef.hostView);

    const dialog = new DialogRef<TResponse>(dialogRef);
    this.openedDialog = dialog;
    dialogRef.instance.dialogRef = dialog;

    return dialog;
  }

  private closeDialog() {
    this.openedDialog?.cancel();
  }
}
