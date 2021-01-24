import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { LogService } from 'src/app/logging/log.service';
import { State } from 'src/app/ngrx.module';
import { IConnection } from '../../../../../ipcModels/IConnection';
import { IQueueSelectionEvent } from '../models/IQueueSelectionEvent';
import { refreshQueues } from '../ngrx/queues.actions';
import { IQueue } from '../ngrx/queues.models';
import { getQueues } from '../ngrx/queues.selectors';

@Component({
  selector: 'app-queue-plane-base',
  templateUrl: './queue-plane-base.component.html',
  styleUrls: ['./queue-plane-base.component.scss']
})
export class QueuePlaneBaseComponent implements OnChanges, OnDestroy {
  @Input()
  connection: IConnection;

  @Output()
  queueSelected = new EventEmitter<IQueueSelectionEvent>();

  @Output()
  queueContextMenuSelected = new EventEmitter<IQueueSelectionEvent>();

  queues: IQueue[];
  queueSubscription: Subscription;
  loading: boolean = false;

  constructor(
    private store: Store<State>,
    private log: LogService
  ) { }

  ngOnChanges(): void {
    this.subscribe();
    this.refreshQueues(null);
  }

  ngOnDestroy(): void {
    this.queueSubscription.unsubscribe();
  }

  subscribe() {
    if (this.queueSubscription) {
      this.queueSubscription.unsubscribe();
    }

    if (!this.connection) {
      this.log.logError('Cannot load queues since connection is not set');
      return;
    }
    
    this.queueSubscription = this.store.select(getQueues(this.connection.id)).subscribe((queues) => {
      this.loading = false;
      this.queues = queues;
    });
  }

  refreshQueues($event: Event | null) {
    if (this.connection) {
      this.loading = true;
      this.store.dispatch(refreshQueues({connectionId: this.connection.id}));
    } else {
      this.queues = [];
    }

    $event?.stopPropagation();
  }

  onQueueSelected(queue: IQueueSelectionEvent) {
    this.queueSelected.emit(queue);
  }

  onQueueContextMenuSelected(queue: IQueueSelectionEvent) {
    this.queueContextMenuSelected.emit(queue);
  }
}
