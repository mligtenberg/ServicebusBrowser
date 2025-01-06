import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopicWithChildrenAndLoadingState, TopicWithMetaData } from '@service-bus-browser/topology-contracts';
import { faFolderTree } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { Tooltip } from 'primeng/tooltip';
import { Button } from 'primeng/button';
import { ContextMenu } from 'primeng/contextmenu';
import { MenuItem } from 'primeng/api';
import { ContextMenuComponent } from '@service-bus-browser/shared-components';
import { SbbMenuItem } from '@service-bus-browser/shared-contracts';
import { GenericTreeNodeComponent } from '../generic-tree-node/generic-tree-node.component';

@Component({
  selector: 'sbb-tpl-topic-tree-node',
  imports: [
    CommonModule,
    FaIconComponent,
    Tooltip,
    Button,
    ContextMenuComponent,
    GenericTreeNodeComponent,
  ],
  templateUrl: './topic-tree-node.component.html',
  styleUrl: './topic-tree-node.component.scss',
})
export class TopicTreeNodeComponent {
  topic = input.required<TopicWithChildrenAndLoadingState>();
  showRefresh = input.required<boolean>();
  icon = faFolderTree;

  refreshTopic = output<TopicWithMetaData>();
  contextMenuItems = input<SbbMenuItem<TopicWithMetaData>[]>();

  onRefresh() {
    this.refreshTopic.emit(this.topic());
  }

  protected readonly top = top;
}
