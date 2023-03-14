import { Component } from '@angular/core';
import { CdkDialogContainer } from '@angular/cdk/dialog';
@Component({
    selector: 'app-dialog-container',
    templateUrl: './dialog-container.component.html',
    styleUrls: ['./dialog-container.component.scss'],
})
export class DialogContainerComponent extends CdkDialogContainer {}
