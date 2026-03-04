import { Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { Tooltip } from 'primeng/tooltip';
import { TopologyNode } from '@service-bus-browser/message-queue-contracts';
import { Button } from 'primeng/button';
import { Store } from '@ngrx/store';
import {
  TopologyActions,
  TopologySelectors,
} from '@service-bus-browser/topology-store';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';

@Component({
  selector: 'sbb-tpl-generic-tree-node',
  imports: [CommonModule, FaIconComponent, Tooltip, Button],
  templateUrl: './generic-tree-node.component.html',
  styleUrl: './generic-tree-node.component.scss',
})
export class GenericTreeNodeComponent {
  store = inject(Store);

  node = input.required<TopologyNode>();
  isLoading = toSignal(toObservable(this.node).pipe(
    switchMap((node) => this.store.select(TopologySelectors.selectTopologyPathLoading(node.path)))
  ), { initialValue: true });

  showMessageCounts = computed(() => {
    const node = this.node();
    if (!node.availableMessageCounts) {
      return undefined;
    }

    return Object.entries(node.availableMessageCounts).length > 0;
  });

  messageCountSummary = computed(() => {
    const node = this.node();
    if (!node.availableMessageCounts) {
      return undefined;
    }

    const entities = Object.entries(node.availableMessageCounts);
    if (entities.length === 0) {
      return undefined;
    }

    return `(${entities.map(([key, value]) => `${value}`).join(', ')})`;
  });

  messageCountEntities = computed(() => {
    const node = this.node();
    if (!node.availableMessageCounts) {
      return undefined;
    }

    return Object.entries(node.availableMessageCounts);
  });

  showRefresh = computed(() => {
    const node = this.node();
    const showMessageCounts = this.showMessageCounts();

    return !showMessageCounts && node.refreshable;
  });

  refresh() {
    this.store.dispatch(TopologyActions.refreshTopology({
      path: this.node().path,
    }));
  }
}
