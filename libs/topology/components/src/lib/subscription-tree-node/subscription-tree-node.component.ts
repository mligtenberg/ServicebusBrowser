import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from '@service-bus-browser/topology-contracts';
import { faFolder } from '@fortawesome/free-regular-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { Tooltip } from 'primeng/tooltip';
import { MenuItem } from 'primeng/api';
import { ContextMenu } from 'primeng/contextmenu';
import { ContextMenuComponent } from '@service-bus-browser/shared-components';
import { SbbMenuItem } from '@service-bus-browser/shared-contracts';

@Component({
  selector: 'sbb-tpl-subscription-tree-node',
  imports: [
    CommonModule,
    FaIconComponent,
    Tooltip,
    ContextMenuComponent,
  ],
  templateUrl: './subscription-tree-node.component.html',
  styleUrl: './subscription-tree-node.component.scss',
})
export class SubscriptionTreeNodeComponent {
  subscription = input.required<Subscription>();
  icon = faFolder;
  contextMenuItems = input<SbbMenuItem<Subscription>[]>();
}
