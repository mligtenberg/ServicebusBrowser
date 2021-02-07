import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { State } from 'src/app/ngrx.module';
import { ITargetSelectedEvent, TargetSelectionType } from '../models/ITargetSelectedEvent';
import { IConnection } from '../ngrx/connections.models';
import { getActiveConnections } from '../ngrx/connections.selectors';

@Component({
  selector: 'app-select-target-connection-plane',
  templateUrl: './select-target-connection-plane.component.html',
  styleUrls: ['./select-target-connection-plane.component.scss']
})
export class SelectTargetConnectionPlaneComponent implements OnInit {
  public connections: IConnection[] = [];
  public subs = new Subscription();

  @Input()
  allowedTargets: TargetSelectionType[];

  @Output()
  targetSelected = new EventEmitter<ITargetSelectedEvent>();

  constructor(
    private store: Store<State>
  ) { }

  ngOnInit(): void {
    this.subs.add(this.store.select(getActiveConnections).subscribe(c => this.connections = c));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  onTargetSelected(event: ITargetSelectedEvent) {
    this.targetSelected.emit(event);
  }
}
