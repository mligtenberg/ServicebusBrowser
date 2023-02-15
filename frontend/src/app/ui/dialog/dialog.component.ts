import { Component, Injector, OnInit, Type, ValueProvider } from '@angular/core';
import { DialogOptions } from '../models/dialogOptions';
import { DialogRef } from 'src/app/ui/models/dialogRef';

@Component({
    selector: 'app-dialog',
    templateUrl: './dialog.component.html',
    styleUrls: ['./dialog.component.scss'],
})
export class DialogComponent implements OnInit {
    componentType: Type<any>;
    dialogRef: DialogRef<any>;
    options: DialogOptions;
    customInjector: Injector;

    constructor(private injector: Injector) {}

    ngOnInit(): void {
        this.customInjector = Injector.create({
            providers: [
                { provide: DialogRef, useValue: this.dialogRef } as ValueProvider,
                { provide: DialogOptions, useValue: this.options } as ValueProvider,
            ],
            parent: this.injector,
        });
    }

    closeDialog() {
        this.dialogRef.cancel();
    }
}
