import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { addLog } from 'src/app/logging/ngrx/logging.actions';
import { LogLevel } from 'src/app/logging/ngrx/logging.models';
import { SubSink } from 'subsink';
import { State } from '../../ngrx.module';
import {
  clearSelectedConnection,
  createConnection,
  openSelectedConnection,
  storeSelectedConnection,
  testConnection,
  updateSelectedConnection,
} from '../ngrx/connections.actions';
import {
  ConnectionType,
  IConnection,
  IConnectionStringConnectionDetails,
} from '../ngrx/connections.models';
import { getSelectedConnection } from '../ngrx/connections.selectors';

interface ConnectionForm {
  name: string;
  type: string;
  connectionString: string;
  tested: boolean;
}
@Component({
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements OnInit, OnDestroy {
  isNew = true;
  subSink = new SubSink();
  connectionForm: FormGroup;
  init = false;

  constructor(private store: Store<State>, private formBuilder: FormBuilder) {
    this.connectionForm = this.formBuilder.group({
      name: ['', Validators.required],
      type: 'connectionString',
      connectionString: '',
      tested: [false, Validators.requiredTrue],
    });
  }

  ngOnInit(): void {
    this.subSink.add(
      this.connectionForm.valueChanges.subscribe((v) => {
        const form = v as ConnectionForm;
        this.setSelected(this.formToConnection(form));
        this.setNameIfEmpty();
      })
    );

    this.subscribeToChanges();
  }

  private subscribeToChanges() {
    this.subSink.add(
      this.store.select(getSelectedConnection).subscribe((s) => {
        if (!this.init) {
          this.init = true;
          this.isNew = s.isNew;

          this.connectionForm.setValue({
            connectionString: (s.connectionDetails as IConnectionStringConnectionDetails)
              .connectionString,
            name: s.name,
            tested: s.testSuccess,
            type: 'connectionString',
          } as ConnectionForm);
        } else if (!!this.connectionForm.value.tested !== !!s.testSuccess) {
          this.connectionForm.patchValue({ tested: s.testSuccess });
        }
      })
    );
  }

  private setSelected(connection: IConnection) {
    this.store.dispatch(updateSelectedConnection({ connection }));
  }

  private formToConnection(form: ConnectionForm): IConnection {
    return {
      id: null,
      name: form.name,
      connectionType: ConnectionType.connectionString,
      testSuccess: false,
      connectionDetails: {
        connectionString: form.connectionString,
      } as IConnectionStringConnectionDetails,
      isNew: this.isNew
    };
  }

  private setNameIfEmpty(): void {
    if (this.connectionForm.value.name == '' && (<string> this.connectionForm.value.connectionString).indexOf('Endpoint=') >= 0) {
      const connectionStringParts = (<string> this.connectionForm.value.connectionString).split(';');
      const endpointPart = connectionStringParts.find(c => c.toLocaleLowerCase().startsWith("endpoint"));
      let name = (endpointPart?.split('//')[1]).replace('/', '');

      this.connectionForm.patchValue({name});
    }
  }

  onSubmit() {
    this.store.dispatch(openSelectedConnection());
  }

  storeConnection() {
    this.store.dispatch(storeSelectedConnection());
  }

  test() {
    this.store.dispatch(
      addLog({ message: 'testing connection', logLevel: LogLevel.verbose })
    );
    this.store.dispatch(testConnection());
  }

  cancel() {
    this.store.dispatch(clearSelectedConnection());
  }

  ngOnDestroy() {
    this.subSink.unsubscribe();
  }
}
