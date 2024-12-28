import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Namespace } from '@service-bus-browser/topology-contracts';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faServer } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from 'primeng/tooltip';
import { ContextMenu } from 'primeng/contextmenu';
import { SbbMenuItem } from '@service-bus-browser/shared-contracts';
import { MenuItemCommandEvent } from 'primeng/api/menuitem';

@Component({
  selector: 'sbb-tpl-namespace-tree-node',
  imports: [CommonModule, FaIconComponent, Tooltip, ContextMenu],
  templateUrl: './namespace-tree-node.component.html',
  styleUrl: './namespace-tree-node.component.scss',
})
export class NamespaceTreeNodeComponent {
  namespace = input.required<Namespace>();
  icon = faServer;
  contextMenuItems = input<SbbMenuItem<Namespace>[]>();
  modifiedContextMenuItems = computed(() => {
    return this.contextMenuItems()?.map((item) => {
      return {
        ...item,
        command: (event: MenuItemCommandEvent) => this.onSelect(event, item),
      };
    });
  })


  onSelect(event: MenuItemCommandEvent, menuItem: SbbMenuItem<Namespace>) {
    menuItem.onSelect?.(this.namespace(), event);
  }
}
