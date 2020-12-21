import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { createConnection } from './connections/ngrx/connections.actions';
import { LogService } from './logging/log.service';
import { addLog } from './logging/ngrx/logging.actions';
import { LogLevel } from './logging/ngrx/logging.models';
import { getLogMessages } from './logging/ngrx/logging.selectors';
import { State } from './ngrx.module';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Servicebus Browser';
  logs = [];

  constructor(
    private store: Store<State>,
    private router: Router,
    private log: LogService
  ) {
    this.store.select(getLogMessages).subscribe(l => {
      this.logs = l;
    });

    this.log.logInfo("Thank you for using Servicebus Browser");
    this.log.logInfo("This app is currently in development");
  }

  connectPressed(): void {
    this.store.dispatch(createConnection());
    this.router.navigate(["connections", "edit"]);
  }
}
