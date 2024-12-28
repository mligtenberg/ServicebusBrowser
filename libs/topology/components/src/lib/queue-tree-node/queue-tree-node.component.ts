import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Queue } from '@service-bus-browser/topology-contracts';
import { faFolder } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { Tooltip } from 'primeng/tooltip';
import { ContextMenu } from 'primeng/contextmenu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'sbb-tpl-queue-tree-node',
  imports: [CommonModule, FaIconComponent, Tooltip, ContextMenu],
  templateUrl: './queue-tree-node.component.html',
  styleUrl: './queue-tree-node.component.scss',
})
export class QueueTreeNodeComponent {
  queue = input.required<Queue>();
  icon = faFolder;
  contextMenuItems = input<MenuItem[]>();
}
