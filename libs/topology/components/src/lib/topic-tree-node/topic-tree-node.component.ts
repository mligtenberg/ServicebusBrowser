import { Component, input, output } from '@angular/core';

import { TopicWithChildrenAndLoadingState, TopicWithMetaData } from '@service-bus-browser/topology-contracts';
import { faFolderTree } from '@fortawesome/free-solid-svg-icons';
import { GenericTreeNodeComponent } from '../generic-tree-node/generic-tree-node.component';

@Component({
  selector: 'sbb-tpl-topic-tree-node',
  imports: [
    GenericTreeNodeComponent
],
  templateUrl: './topic-tree-node.component.html',
  styleUrl: './topic-tree-node.component.scss',
})
export class TopicTreeNodeComponent {
  topic = input.required<TopicWithChildrenAndLoadingState>();
  showRefresh = input.required<boolean>();
  icon = faFolderTree;

  refreshTopic = output<TopicWithMetaData>();

  onRefresh() {
    this.refreshTopic.emit(this.topic());
  }

  protected readonly top = top;
}
