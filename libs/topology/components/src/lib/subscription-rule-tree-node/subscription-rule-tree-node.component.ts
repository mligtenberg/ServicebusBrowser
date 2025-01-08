import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionRule } from '@service-bus-browser/topology-contracts';
import { SbbMenuItem } from '@service-bus-browser/shared-contracts';
import { faCheckToSlot } from '@fortawesome/free-solid-svg-icons';
import { GenericTreeNodeComponent } from '../generic-tree-node/generic-tree-node.component';

@Component({
  selector: 'sbb-tpl-subscription-rule-tree-node',
  imports: [
    CommonModule,
    GenericTreeNodeComponent,
  ],
  templateUrl: './subscription-rule-tree-node.component.html',
  styleUrl: './subscription-rule-tree-node.component.scss',
})
export class SubscriptionRuleTreeNodeComponent {
  rule = input.required<SubscriptionRule>();
  icon = faCheckToSlot;
  contextMenuItems = input<SbbMenuItem<SubscriptionRule>[]>();
}
