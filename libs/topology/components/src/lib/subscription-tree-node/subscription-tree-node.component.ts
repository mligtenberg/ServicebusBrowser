import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from '@service-bus-browser/topology-contracts';
import { faFolder } from '@fortawesome/free-regular-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'sbb-tpl-subscription-tree-node',
  imports: [CommonModule, FaIconComponent, Tooltip],
  templateUrl: './subscription-tree-node.component.html',
  styleUrl: './subscription-tree-node.component.scss',
})
export class SubscriptionTreeNodeComponent {
  subscription = input.required<Subscription>();
  icon = faFolder;
}
