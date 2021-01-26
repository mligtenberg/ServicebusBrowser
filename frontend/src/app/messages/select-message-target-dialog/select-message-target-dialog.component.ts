import { Component } from '@angular/core';
import { ITargetSelectedEvent, TargetSelectionType } from 'src/app/connections/models/ITargetSelectedEvent';

@Component({
  selector: 'app-select-message-target-dialog',
  templateUrl: './select-message-target-dialog.component.html',
  styleUrls: ['./select-message-target-dialog.component.scss']
})
export class SelectMessageTargetDialogComponent {

  allowedTarget: TargetSelectionType[] = [
    TargetSelectionType.queue,
    TargetSelectionType.topic
  ]

  constructor() { }

  onTargetSelected(event: ITargetSelectedEvent) {
    console.log(event);
  }
}
