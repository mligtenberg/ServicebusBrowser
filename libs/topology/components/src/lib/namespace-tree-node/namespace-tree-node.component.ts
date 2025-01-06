import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Namespace } from '@service-bus-browser/topology-contracts';
import { faServer } from '@fortawesome/free-solid-svg-icons';
import { SbbMenuItem } from '@service-bus-browser/shared-contracts';
import { GenericTreeNodeComponent } from '../generic-tree-node/generic-tree-node.component';

@Component({
  selector: 'sbb-tpl-namespace-tree-node',
  imports: [
    CommonModule,
    GenericTreeNodeComponent,
  ],
  templateUrl: './namespace-tree-node.component.html',
  styleUrl: './namespace-tree-node.component.scss',
})
export class NamespaceTreeNodeComponent {
  namespace = input.required<Namespace>();
  icon = faServer;
  contextMenuItems = input<SbbMenuItem<Namespace>[]>();
}
