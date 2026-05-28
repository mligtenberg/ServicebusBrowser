import { Component, input, output } from '@angular/core';

import { Task } from '@service-bus-browser/tasks-contracts';
import { ProgressBar } from 'primeng/progressbar';
import { Button } from 'primeng/button';

@Component({
  selector: 'sbb-task-card',
  imports: [ProgressBar, Button],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss',
})
export class TaskCardComponent {
  task = input.required<Task>();
  cancelTask = output<void>();
}
