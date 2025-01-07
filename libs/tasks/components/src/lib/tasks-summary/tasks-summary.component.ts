import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Task } from '@service-bus-browser/tasks-contracts';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCircleCheck } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'sbb-task-list-summary',
  imports: [CommonModule, ProgressSpinner, FaIconComponent],
  templateUrl: './tasks-summary.component.html',
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
