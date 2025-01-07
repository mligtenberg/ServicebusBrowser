import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '@service-bus-browser/tasks-contracts';
import { ProgressBar } from 'primeng/progressbar';

@Component({
  selector: 'sbb-task-card',
  imports: [CommonModule, ProgressBar],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss',
})
export class TaskCardComponent {
  task = input.required<Task>();
}
