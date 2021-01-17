import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { createConnection, openConnection } from './connections/ngrx/connections.actions';
import { IConnection } from './connections/ngrx/connections.models';
import { getStoredConnections } from './connections/ngrx/connections.selectors';
import { LogService } from './logging/log.service';
import { State } from './ngrx.module';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  logs: string[] = [];
  storedConnections: IConnection[] = [];

  subs = new Subscription();

  constructor(
    private store: Store<State>,
    private log: LogService
  ) {
  }

  ngOnInit(): void {
    this.subs.add(this.store.select(getStoredConnections).subscribe(c => {
      this.storedConnections = c;
    }))

    this.log.logInfo("Thank you for testing Servicebus Browser");
    this.log.logVerbose("This app is currently in development, many features still need to be implemented");
  }

  connectPressed(): void {
    this.store.dispatch(createConnection());
  }

  openConnection(connection: IConnection): void {
    this.store.dispatch(openConnection({connection}));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
