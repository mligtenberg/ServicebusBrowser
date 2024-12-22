import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Namespace } from '@service-bus-browser/topology-contracts';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faServer } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'sbb-tpl-namespace-tree-node',
  imports: [CommonModule, FaIconComponent],
  templateUrl: './namespace-tree-node.component.html',
  styleUrl: './namespace-tree-node.component.scss',
})
export class NamespaceTreeNodeComponent {
  namespace = input.required<Namespace>();
  icon = faServer;
}
