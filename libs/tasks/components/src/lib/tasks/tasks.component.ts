import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TasksSummaryComponent } from '../tasks-summary/tasks-summary.component';
import { Task } from '@service-bus-browser/tasks-contracts';
import { Popover } from 'primeng/popover';
import { TaskCardComponent } from '../task-card/task-card.component';

@Component({
  selector: 'sbb-task-tasks',
  imports: [CommonModule, TasksSummaryComponent, Popover, TaskCardComponent],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss',
})
export class TasksComponent {
  tasks = input.required<Task[]>();

  togglePopover(op: Popover, $event: Event) {
    if (this.tasks().length === 0) {
      return;
    }

    op.toggle($event);
  }
}
