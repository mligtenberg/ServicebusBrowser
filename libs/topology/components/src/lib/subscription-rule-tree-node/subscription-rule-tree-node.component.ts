import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionRule } from '@service-bus-browser/topology-contracts';
import { SbbMenuItem } from '@service-bus-browser/shared-contracts';
import { ContextMenuComponent } from '@service-bus-browser/shared-components';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { Tooltip } from 'primeng/tooltip';
import { faCheckToSlot } from '@fortawesome/free-solid-svg-icons';
import { Button } from 'primeng/button';

@Component({
  selector: 'sbb-tpl-subscription-rule-tree-node',
  imports: [
    CommonModule,
    ContextMenuComponent,
    FaIconComponent,
    Tooltip,
    Button,
  ],
  templateUrl: './subscription-rule-tree-node.component.html',
  styleUrl: './subscription-rule-tree-node.component.scss',
})
export class SubscriptionRuleTreeNodeComponent {
  rule = input.required<SubscriptionRule>();
  icon = faCheckToSlot;
  contextMenuItems = input<SbbMenuItem<SubscriptionRule>[]>();
}
