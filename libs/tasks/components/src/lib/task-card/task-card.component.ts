import { Component, input, output } from '@angular/core';

import { Task } from '@service-bus-browser/tasks-contracts';
import { SbbButton, SbbProgressBar } from '@service-bus-browser/shared-ui';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'sbb-task-card',
  imports: [SbbProgressBar, SbbButton],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss',
})
export class TaskCardComponent {
  task = input.required<Task>();
  cancelTask = output<void>();
  protected readonly cancelIcon = faXmark;
}
