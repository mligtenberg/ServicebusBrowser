import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Topic } from '@service-bus-browser/topology-contracts';
import { faFolderTree } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { Tooltip } from 'primeng/tooltip';
import { Button } from 'primeng/button';
import { ContextMenu } from 'primeng/contextmenu';
import { MenuItem } from 'primeng/api';
import { ContextMenuComponent } from '@service-bus-browser/shared-components';
import { SbbMenuItem } from '@service-bus-browser/shared-contracts';

@Component({
  selector: 'sbb-tpl-topic-tree-node',
  imports: [
    CommonModule,
    FaIconComponent,
    Tooltip,
    Button,
    ContextMenuComponent,
  ],
  templateUrl: './topic-tree-node.component.html',
  styleUrl: './topic-tree-node.component.scss',
})
export class TopicTreeNodeComponent {
  topic = input.required<Topic>();
  showRefresh = input.required<boolean>();
  icon = faFolderTree;

  refreshTopic = output<Topic>();
  contextMenuItems = input<SbbMenuItem<Topic>[]>();

  refresh($event: MouseEvent) {
    this.refreshTopic.emit(this.topic());
    $event.stopPropagation();
  }
}
