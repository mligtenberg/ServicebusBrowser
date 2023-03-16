import { Injectable, OnDestroy, TemplateRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { ContextmenuComponent } from './contextmenu/contextmenu.component';
import { Dialog } from '@angular/cdk/dialog';
import { Overlay } from '@angular/cdk/overlay';

@Injectable({
    providedIn: 'root',
})
export class ContextmenuService implements OnDestroy {
    private subs = new Subscription();

    constructor(private dialog: Dialog, private overlay: Overlay) {}

    public openContextmenu(options: {
        templateRef: TemplateRef<any>;
        mousePosition: {
            x: number;
            y: number;
        };
        width: number;
    }) {
        this.closeContextmenu();

        this.dialog.open(options.templateRef, {
            width: options.width + 'px',
            positionStrategy: this.overlay
                .position()
                .global()
                .top(options.mousePosition.y + 'px')
                .left(options.mousePosition.x + 'px'),
            backdropClass: 'transparent',
            container: ContextmenuComponent,
        });
    }

    closeContextmenu() {
        this.dialog.closeAll();
    }

    ngOnDestroy() {
        this.subs.unsubscribe();
    }
}
