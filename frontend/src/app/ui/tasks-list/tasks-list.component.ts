import { Component, OnInit } from '@angular/core';
import {Store} from '@ngrx/store';
import {State} from '../../ngrx.module';
import {tasksSelector} from '../../ngrx/selectors';
import {ITask} from '../../ngrx/models';

@Component({
  selector: 'app-tasks-list',
  templateUrl: './tasks-list.component.html',
  styleUrls: ['./tasks-list.component.scss']
})
export class TasksListComponent implements OnInit {
  public tasks: ITask[] = [];

  constructor(private store: Store<State>) { }

  ngOnInit(): void {
    this.store.select(tasksSelector).subscribe(tasks => {
      this.tasks = tasks;
    });
  }

}
