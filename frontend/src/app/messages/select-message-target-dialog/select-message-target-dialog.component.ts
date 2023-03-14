import { Component } from '@angular/core';
import { ITargetSelectedEvent, TargetSelectionType } from 'src/app/connections/models/ITargetSelectedEvent';
import { ISelectedMessagesTarget } from '../models/ISelectedMessagesTarget';
import { DialogRef } from '@angular/cdk/dialog';

@Component({
    selector: 'app-select-message-target-dialog',
    templateUrl: './select-message-target-dialog.component.html',
    styleUrls: ['./select-message-target-dialog.component.scss'],
})
export class SelectMessageTargetDialogComponent {
    allowedTarget: TargetSelectionType[] = [TargetSelectionType.queue, TargetSelectionType.topic];

    constructor(private dialog: DialogRef<ISelectedMessagesTarget>) {}

    onTargetSelected(event: ITargetSelectedEvent) {
        this.dialog.close({
            connectionId: event.connection.id,
            queueOrTopicName: event.name,
        });
    }
}
