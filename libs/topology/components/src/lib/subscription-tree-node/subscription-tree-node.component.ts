import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionWithMetaData } from '@service-bus-browser/topology-contracts';
import { faFolder } from '@fortawesome/free-regular-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { Tooltip } from 'primeng/tooltip';
import { ContextMenuComponent } from '@service-bus-browser/shared-components';
import { SbbMenuItem } from '@service-bus-browser/shared-contracts';
import { Button } from 'primeng/button';

@Component({
  selector: 'sbb-tpl-subscription-tree-node',
  imports: [
    CommonModule,
    FaIconComponent,
    Tooltip,
    ContextMenuComponent,
    Button,
  ],
  templateUrl: './subscription-tree-node.component.html',
  styleUrl: './subscription-tree-node.component.scss',
})
export class SubscriptionTreeNodeComponent {
  subscription = input.required<SubscriptionWithMetaData>();
  icon = faFolder;
  contextMenuItems = input<SbbMenuItem<SubscriptionWithMetaData>[]>();
  showRefresh = input<boolean>(false);
  refreshSubscription = output<SubscriptionWithMetaData>();

  refresh($event: MouseEvent) {
    this.refreshSubscription.emit(this.subscription());
    $event.stopPropagation();
  }
}
