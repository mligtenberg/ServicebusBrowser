import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { addLog } from 'src/app/logging/ngrx/logging.actions';
import { LogLevel } from 'src/app/logging/ngrx/logging.models';
import { State } from '../../ngrx.module';
import { clearSelectedConnection, createConnection, setSelectedConnectionConnectionString, setSelectedConnectionName, storeSelectedConnection, testConnection } from '../ngrx/connections.actions';
import { IConnection } from '../ngrx/connections.models';
import { getSelectedConnection } from '../ngrx/connections.selectors';

@Component({
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {
  selectedConnection: IConnection | null = null;

  constructor(
    private store: Store<State>,
    private router: Router
    ) { }

  ngOnInit(): void {
    // TODO: Unsubscribe
    this.store.select(getSelectedConnection).subscribe(s => {
      this.selectedConnection = s;
      if (this.selectedConnection == null) {
        this.store.dispatch(createConnection());
      }
    })
  }

  onNameChange($event: Event) {
    const element = $event.target as HTMLInputElement;
    this.store.dispatch(setSelectedConnectionName({
      name: element.value
    }))
  }

  onConnectionStringChange($event: Event) {
    const element = $event.target as HTMLInputElement;
    this.store.dispatch(setSelectedConnectionConnectionString({
      connectionString: element.value
    }))
  }

  test() {
    if (this.selectedConnection !== null) {
      this.store.dispatch(addLog({message: 'testing connection', logLevel: LogLevel.verbose}))
      this.store.dispatch(testConnection());
    }
  }

  save() {
    this.store.dispatch(storeSelectedConnection());
  }

  cancel() {
    this.store.dispatch(clearSelectedConnection());
    this.router.navigateByUrl('/');
  }
}
