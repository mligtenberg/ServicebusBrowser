import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { LogService } from 'src/app/logging/log.service';
import { State } from 'src/app/ngrx.module';
import { IConnection } from '../../../../../ipcModels/IConnection';
import { refreshQueues } from '../ngrx/queues.actions';
import { IQueue } from '../ngrx/queues.models';
import { getQueues } from '../ngrx/queues.selectors';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons'

@Component({
  selector: 'app-queue-plane',
  templateUrl: './queue-plane.component.html',
  styleUrls: ['./queue-plane.component.scss']
})
export class QueuePlaneComponent implements OnChanges, OnDestroy {

  @Input()
  connection: IConnection;
  queues: IQueue[];

  refreshIcon = faSyncAlt;
  queueSubscription: Subscription;


  constructor(
    private store: Store<State>,
    private log: LogService
  ) { }

  ngOnChanges(): void {
    this.resubscribe();
    this.refreshQueues(null);
  }

  ngOnDestroy(): void {
    this.queueSubscription.unsubscribe();
  }

  resubscribe() {
    if (this.queueSubscription) {
      this.queueSubscription.unsubscribe();
    }

    if (!this.connection) {
      this.log.logError('Cannot load queues since connection is not set');
      return;
    }
    
    this.queueSubscription = this.store.select(getQueues(this.connection.id)).subscribe((queues) => {
      console.log(queues);
      this.queues = queues;
    });
  }

  refreshQueues($event: Event | null) {
    if (this.connection) {
      this.store.dispatch(refreshQueues({connectionId: this.connection.id}));
    } else {
      this.queues = [];
    }

    $event?.stopPropagation();
  }
}
