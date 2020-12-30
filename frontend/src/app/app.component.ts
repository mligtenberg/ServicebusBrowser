import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { SubSink } from 'subsink';
import { createConnection, openConnection } from './connections/ngrx/connections.actions';
import { IConnection } from './connections/ngrx/connections.models';
import { getStoredConnections } from './connections/ngrx/connections.selectors';
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
export class AppComponent implements OnInit, OnDestroy {
  logs: string[] = [];
  storedConnections: IConnection[] = [];

  subsink = new SubSink();

  constructor(
    private store: Store<State>,
    private router: Router,
    private log: LogService
  ) {
  }

  ngOnInit(): void {
    this.subsink.add(this.store.select(getLogMessages).subscribe(l => {
      this.logs = l;
    }));

    this.subsink.add(this.store.select(getStoredConnections).subscribe(c => {
      this.storedConnections = c;
    }))

    this.log.logInfo("Thank you for testing Servicebus Browser");
    this.log.logInfo("This app is currently in development, many features still need to be implemented");
  }

  connectPressed(): void {
    this.store.dispatch(createConnection());
    this.router.navigate(["connections", "edit"]);
  }

  openConnection(connection: IConnection): void {
    this.store.dispatch(openConnection({connection}));
  }

  ngOnDestroy(): void {
    this.subsink.unsubscribe();
  }
}
