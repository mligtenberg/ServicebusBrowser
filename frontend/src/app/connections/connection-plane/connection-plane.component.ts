import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from 'src/app/ngrx.module';
import { IConnection } from '../ngrx/connections.models';
import { getActiveConnections } from '../ngrx/connections.selectors';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-connection-plane',
  templateUrl: './connection-plane.component.html',
  styleUrls: ['./connection-plane.component.scss']
})
export class ConnectionPlaneComponent implements OnInit, OnDestroy {
  public connections: IConnection[] = [];
  public subs = new Subscription();

  constructor(
    private store: Store<State>
  ) { }

  ngOnInit(): void {
    this.subs.add(this.store.select(getActiveConnections).subscribe(c => this.connections = c));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
