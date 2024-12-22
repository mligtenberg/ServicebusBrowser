import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Topic } from '@service-bus-browser/topology-contracts';
import { faFolderTree } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'sbb-tpl-topic-tree-node',
  imports: [CommonModule, FaIconComponent],
  templateUrl: './topic-tree-node.component.html',
  styleUrl: './topic-tree-node.component.scss',
})
export class TopicTreeNodeComponent {
  topic = input.required<Topic>();
  icon = faFolderTree;
}
