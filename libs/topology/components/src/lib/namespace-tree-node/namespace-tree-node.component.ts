import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Namespace } from '@service-bus-browser/topology-contracts';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faServer } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from 'primeng/tooltip';
import { SbbMenuItem } from '@service-bus-browser/shared-contracts';
import { MenuItemCommandEvent } from 'primeng/api/menuitem';
import { ContextMenuComponent } from '@service-bus-browser/shared-components';

@Component({
  selector: 'sbb-tpl-namespace-tree-node',
  imports: [
    CommonModule,
    FaIconComponent,
    Tooltip,
    ContextMenuComponent,
  ],
  templateUrl: './namespace-tree-node.component.html',
  styleUrl: './namespace-tree-node.component.scss',
})
export class NamespaceTreeNodeComponent {
  namespace = input.required<Namespace>();
  icon = faServer;
  contextMenuItems = input<SbbMenuItem<Namespace>[]>();
}
