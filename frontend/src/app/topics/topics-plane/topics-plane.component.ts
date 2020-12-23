import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { LogService } from 'src/app/logging/log.service';
import { State } from 'src/app/ngrx.module';
import { IConnection } from '../../../../../ipcModels/IConnection';
import { refreshTopics } from '../ngrx/topics.actions';
import { ITopic } from '../ngrx/topics.models';
import { getTopics } from '../ngrx/topics.selectors';

@Component({
  selector: 'app-topics-plane',
  templateUrl: './topics-plane.component.html',
  styleUrls: ['./topics-plane.component.scss']
})
export class TopicsPlaneComponent implements OnChanges {

  @Input()
  connection: IConnection;
  topics: ITopic[];

  refreshIcon = faSyncAlt;
  topicsSubscription: Subscription;


  constructor(
    private store: Store<State>,
    private log: LogService
  ) { }

  ngOnChanges(): void {
    this.resubscribe();
    this.refreshTopics(null);
  }

  ngOnDestroy(): void {
    this.topicsSubscription.unsubscribe();
  }

  resubscribe() {
    if (this.topicsSubscription) {
      this.topicsSubscription.unsubscribe();
    }

    if (!this.connection) {
      this.log.logError('Cannot load topics since connection is not set');
      return;
    }
    
    this.topicsSubscription = this.store.select(getTopics(this.connection.id)).subscribe((topics) => {
      this.topics = topics;
    });
  }

  refreshTopics($event: Event | null) {
    if (this.connection) {
      this.store.dispatch(refreshTopics({connectionId: this.connection.id}));
    } else {
      this.topics = [];
    }

    $event?.stopPropagation();
  }
}
