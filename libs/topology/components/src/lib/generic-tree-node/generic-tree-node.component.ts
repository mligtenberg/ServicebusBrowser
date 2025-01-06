import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from 'primeng/button';
import { ContextMenuComponent } from '@service-bus-browser/shared-components';
import { FaIconComponent, IconDefinition } from '@fortawesome/angular-fontawesome';
import { SubscriptionWithMetaData } from '@service-bus-browser/topology-contracts';
import { faFolder } from '@fortawesome/free-regular-svg-icons';
import { SbbMenuItem } from '@service-bus-browser/shared-contracts';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'sbb-tpl-generic-tree-node',
  imports: [
    CommonModule,
    Button,
    ContextMenuComponent,
    FaIconComponent,
    Tooltip,
  ],
  templateUrl: './generic-tree-node.component.html',
  styleUrl: './generic-tree-node.component.scss',
})
export class GenericTreeNodeComponent<T> {
  label = input.required<string>();
  data = input.required<T>();
  icon = input.required<IconDefinition>();
  contextMenuItems = input<SbbMenuItem<T>[]>();
  quickAmounts = input<{
    activeMessageCount: number;
    deadLetterMessageCount: number;
    transferDeadLetterMessageCount: number;
  }>();
  showRefresh = input<boolean>(false);
  isRefreshing = input<boolean>(false);
  refreshData = output();

  refresh($event: MouseEvent) {
    this.refreshData.emit();
    $event.stopPropagation();
  }
}
