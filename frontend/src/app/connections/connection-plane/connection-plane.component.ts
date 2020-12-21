import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from 'src/app/ngrx.module';
import { IConnection } from '../ngrx/connections.models';
import { getConnections } from '../ngrx/connections.selectors';
import {SubSink} from 'subsink';

@Component({
  selector: 'app-connection-plane',
  templateUrl: './connection-plane.component.html',
  styleUrls: ['./connection-plane.component.scss']
})
export class ConnectionPlaneComponent implements OnInit, OnDestroy {
  public connections: IConnection[] = [];
  public subs = new SubSink();

  constructor(
    private store: Store<State>
  ) { }

  ngOnInit(): void {
    this.subs.add(this.store.select(getConnections).subscribe(c => this.connections = c));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
