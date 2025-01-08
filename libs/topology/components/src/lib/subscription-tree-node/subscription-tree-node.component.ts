import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  SubscriptionWithMetaData,
  SubscriptionWithMetaDataAndLoadingState
} from '@service-bus-browser/topology-contracts';
import { faFolder } from '@fortawesome/free-regular-svg-icons';
import { SbbMenuItem } from '@service-bus-browser/shared-contracts';
import { GenericTreeNodeComponent } from '../generic-tree-node/generic-tree-node.component';

@Component({
  selector: 'sbb-tpl-subscription-tree-node',
  imports: [
    CommonModule,
    GenericTreeNodeComponent,
  ],
  templateUrl: './subscription-tree-node.component.html',
  styleUrl: './subscription-tree-node.component.scss',
})
export class SubscriptionTreeNodeComponent {
  subscription = input.required<SubscriptionWithMetaDataAndLoadingState>();
  icon = faFolder;
  contextMenuItems = input<SbbMenuItem<SubscriptionWithMetaData>[]>();
  showRefresh = input<boolean>(false);
  refreshSubscription = output<SubscriptionWithMetaData>();

  refresh() {
    this.refreshSubscription.emit(this.subscription());
  }
}
