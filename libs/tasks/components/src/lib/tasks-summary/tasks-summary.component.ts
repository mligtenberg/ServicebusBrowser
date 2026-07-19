import { Component, computed, input, ChangeDetectionStrategy } from '@angular/core';

import { Task } from '@service-bus-browser/tasks-contracts';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCircleCheck } from '@fortawesome/free-regular-svg-icons';
import { SbbProgressSpinner } from '@service-bus-browser/shared-ui';

@Component({
  selector: 'sbb-task-list-summary',
  imports: [SbbProgressSpinner, FaIconComponent],
  templateUrl: './tasks-summary.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './tasks-summary.component.scss',
})
export class TasksSummaryComponent {
  tasks = input.required<Task[]>();
  hasOpenTasks = computed(() =>
    this.tasks().some((t) => t.status !== 'completed')
  );
  numberOfOpenTasks = computed(
    () => this.tasks().filter((t) => t.status !== 'completed').length
  );
  completedIcon = faCircleCheck;
}
