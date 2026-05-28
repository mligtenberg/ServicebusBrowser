import { Component, inject, input } from '@angular/core';

import { TasksSummaryComponent } from '../tasks-summary/tasks-summary.component';
import { Task } from '@service-bus-browser/tasks-contracts';
import { Popover } from 'primeng/popover';
import { TaskCardComponent } from '../task-card/task-card.component';
import { Store } from '@ngrx/store';
import { TasksActions } from '@service-bus-browser/tasks-store';
import { ConfirmationService } from '@service-bus-browser/shared-components';

@Component({
  selector: 'sbb-task-tasks',
  imports: [TasksSummaryComponent, Popover, TaskCardComponent],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss',
})
export class TasksComponent {
  private store = inject(Store);
  private confirmationService = inject(ConfirmationService);

  tasks = input.required<Task[]>();

  togglePopover(op: Popover, $event: Event) {
    op.toggle($event);
  }

  async cancelTask(task: Task) {
    const confirmed = await this.confirmationService.confirm(
      'Cancel task',
      `Are you sure you want to cancel "${task.description}"?`,
      'Cancel task',
      'Keep running'
    );
    if (confirmed) {
      this.store.dispatch(TasksActions.cancelTask({ id: task.id }));
    }
  }
}
