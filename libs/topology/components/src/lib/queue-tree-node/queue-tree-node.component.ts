import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QueueWithMetaData } from '@service-bus-browser/topology-contracts';
import { faFolder } from '@fortawesome/free-solid-svg-icons';
import { SbbMenuItem } from '@service-bus-browser/shared-contracts';
import { GenericTreeNodeComponent } from '../generic-tree-node/generic-tree-node.component';

@Component({
  selector: 'sbb-tpl-queue-tree-node',
  imports: [
    CommonModule,
    GenericTreeNodeComponent,
  ],
  templateUrl: './queue-tree-node.component.html',
  styleUrl: './queue-tree-node.component.scss',
})
export class QueueTreeNodeComponent {
  queue = input.required<QueueWithMetaData>();
  icon = faFolder;
  contextMenuItems = input<SbbMenuItem<QueueWithMetaData>[]>();
}
