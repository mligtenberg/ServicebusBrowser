import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { State } from 'src/app/ngrx.module';
import { selectConnection } from '../ngrx/connections.actions';
import { IConnection } from '../ngrx/connections.models';

@Component({
  selector: 'app-connection-plane-item',
  templateUrl: './connection-plane-item.component.html',
  styleUrls: ['./connection-plane-item.component.scss']
})
export class ConnectionPlaneItemComponent {
  public faEdit = faEdit;

  @Input()
  connection: IConnection | undefined;

  constructor(
    private store: Store<State>,
    private router: Router
  ) { }

  edit(connection: IConnection | undefined) {
    if (connection === undefined) {
      return;
    }

    this.store.dispatch(selectConnection({
      id: connection.id as string
    }));
    this.router.navigate(['connections', 'edit'])
  }
}
