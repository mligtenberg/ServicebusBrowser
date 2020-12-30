import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { LogService } from 'src/app/logging/log.service';
import { State } from 'src/app/ngrx.module';
import { refreshSubscriptions } from '../ngrx/topics.actions';
import { ISubscription, ITopic } from '../ngrx/topics.models';
import { getTopicSubscriptions } from '../ngrx/topics.selectors';

@Component({
  selector: 'app-topics-plane-item',
  templateUrl: './topics-plane-item.component.html',
  styleUrls: ['./topics-plane-item.component.scss']
})
export class TopicsPlaneItemComponent implements OnInit {

  @Input()
  connectionId: string;

  @Input()
  topic: ITopic;

  subscriptions: ISubscription[] = [];
  loading: boolean = false;

  constructor(
    private store: Store<State>,
    private log: LogService
  ) { }

  ngOnInit(): void {
    this.store.select(getTopicSubscriptions(this.connectionId, this.topic.name)).subscribe(s => {
      this.loading = false;
      this.subscriptions = s;
    });
    this.refreshSubscriptions();
  }

  refreshSubscriptions($event: Event = null): void {
    this.loading = true;
    this.log.logInfo(`Refreshing topics for '${this.topic.name}'`);
    this.store.dispatch(refreshSubscriptions({connectionId: this.connectionId, topicName: this.topic.name}));

    $event?.stopPropagation();
  }

}
