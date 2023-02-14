import { ApplicationRef, ComponentFactoryResolver, Injectable, Injector, Type } from '@angular/core';
import { DialogComponent } from './dialog/dialog.component';
import { DialogOptions } from './models/dialogOptions';
import { DialogRef } from './models/dialogRef';
import { ConfirmDialogBodyComponent } from './confirm-dialog-body/confirm-dialog-body.component';
import { Observable } from 'rxjs';
export { DialogRef };

@Injectable({
    providedIn: 'root',
})
export class DialogService {
    private openedDialog: DialogRef<any> | null = null;

    constructor(private componentFactoryResolver: ComponentFactoryResolver, private appRef: ApplicationRef, private injector: Injector) {}

    public openDialog<T, TResponse>(containerContent: Type<T>, options: DialogOptions = null): DialogRef<TResponse> {
        this.closeDialog();

        const dialogRef = this.componentFactoryResolver.resolveComponentFactory(DialogComponent).create(this.injector);

        dialogRef.instance.componentType = containerContent;
        dialogRef.instance.options = options;

        this.appRef.attachView(dialogRef.hostView);

        const dialog = new DialogRef<TResponse>(dialogRef);
        this.openedDialog = dialog;
        dialogRef.instance.dialogRef = dialog;

        return dialog;
    }

    public openConfirmDialog<T>(title: string, confirmMessage: string): Observable<boolean> {
        this.closeDialog();

        const dialogRef = this.componentFactoryResolver.resolveComponentFactory(DialogComponent).create(this.injector);

        dialogRef.instance.componentType = ConfirmDialogBodyComponent;

        const options = new DialogOptions();
        options.set('title', title);
        options.set('message', confirmMessage);

        dialogRef.instance.options = options;

        this.appRef.attachView(dialogRef.hostView);

        const dialog = new DialogRef<boolean>(dialogRef);
        this.openedDialog = dialog;
        dialogRef.instance.dialogRef = dialog;

        return dialog.afterClosed();
    }

    private closeDialog() {
        this.openedDialog?.cancel();
    }
}
