import { Component, inject, model, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollPanel } from 'primeng/scrollpanel';
import { TopologyTreeComponent } from '@service-bus-browser/topology-components';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { TasksComponent } from '@service-bus-browser/tasks-components';
import { TasksSelectors } from '@service-bus-browser/tasks-store';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ColorThemeService } from '@service-bus-browser/services';

@Component({
  selector: 'lib-sidebar',
  imports: [
    CommonModule,
    TopologyTreeComponent,
    TasksComponent,
    ScrollPanel,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent {
  store = inject(Store);
  router = inject(Router);
  maxAmount = model<number>(10);
  fromSequenceNumber = model<number>(0);

  darkMode = inject(ColorThemeService).darkMode;

  openTasks = this.store.selectSignal(TasksSelectors.selectTasks);
}
