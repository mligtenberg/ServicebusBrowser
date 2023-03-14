import { Injectable, TemplateRef } from '@angular/core';
import { Dialog, DialogConfig, DialogRef } from '@angular/cdk/dialog';
import { ComponentType, GlobalPositionStrategy, PositionStrategy } from '@angular/cdk/overlay';
import { DialogContainerComponent } from './dialog-container/dialog-container.component';

@Injectable({
    providedIn: 'root',
})
export class DialogsService {
    constructor(private dialog: Dialog) {}

    open<R = unknown, D = unknown, C = unknown>(
        componentOrTemplateRef: ComponentType<C> | TemplateRef<C>,
        config?: DialogConfig<D, DialogRef<R, C>>
    ): DialogRef<R, C> {
        return this.dialog.open(componentOrTemplateRef, {
            container: DialogContainerComponent,
            ...config,
        });
    }
}
