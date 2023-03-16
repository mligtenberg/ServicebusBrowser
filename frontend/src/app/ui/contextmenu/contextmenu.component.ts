import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CdkDialogContainer } from '@angular/cdk/dialog';

@Component({
    selector: 'app-contextmenu',
    templateUrl: './contextmenu.component.html',
    styleUrls: ['./contextmenu.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContextmenuComponent extends CdkDialogContainer {}
