import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Queue } from '@service-bus-browser/topology-contracts';
import { faFolder } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { Tooltip } from 'primeng/tooltip';
import { MenuItem } from 'primeng/api';
import { ContextMenuComponent } from '@service-bus-browser/shared-components';
import { SbbMenuItem } from '@service-bus-browser/shared-contracts';

@Component({
  selector: 'sbb-tpl-queue-tree-node',
  imports: [CommonModule, FaIconComponent, Tooltip, ContextMenuComponent],
  templateUrl: './queue-tree-node.component.html',
  styleUrl: './queue-tree-node.component.scss',
})
export class QueueTreeNodeComponent {
  queue = input.required<Queue>();
  icon = faFolder;
  contextMenuItems = input<SbbMenuItem<Queue>[]>();
}
