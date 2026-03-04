import {
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { Tooltip } from 'primeng/tooltip';
import {
  ReceiveEndpoint,
  SendEndpoint,
  TopologyNode,
} from '@service-bus-browser/message-queue-contracts';
import { Button } from 'primeng/button';
import { Store } from '@ngrx/store';
import {
  TopologyActions,
  TopologySelectors,
} from '@service-bus-browser/topology-store';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { MenuItem } from 'primeng/api';
import { ContextMenu } from 'primeng/contextmenu';
import { TopologyAction } from '@service-bus-browser/message-queue-contracts';

@Component({
  selector: 'sbb-tpl-generic-tree-node',
  imports: [CommonModule, FaIconComponent, Tooltip, Button, ContextMenu],
  templateUrl: './generic-tree-node.component.html',
  styleUrl: './generic-tree-node.component.scss',
})
export class GenericTreeNodeComponent {
  store = inject(Store);

  node = input.required<TopologyNode>();
  selectionMode = input.required<'actions' | 'send' | 'none'>();

  actionSelected = output<TopologyAction>();
  sendEndpointSelected = output<SendEndpoint>();
  receiveEndpointSelected = output<ReceiveEndpoint>();
  clearReceiveEndpointSelected = output<ReceiveEndpoint>();

  isLoading = toSignal(
    toObservable(this.node).pipe(
      switchMap((node) =>
        this.store.select(
          TopologySelectors.selectTopologyPathLoading(node.path),
        ),
      ),
    ),
    { initialValue: true },
  );

  hasError = toSignal(
    toObservable(this.node).pipe(
      switchMap((node) =>
        this.store.select(
          TopologySelectors.selectTopologyPathHasError(node.path),
        ),
      ),
    ),
    { initialValue: true },
  );

  disableRefresh = computed(() => this.selectionMode() === 'none' || this.isLoading());

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

  contextMenuItems = computed(() => {
    const node = this.node();
    const contextMenu: MenuItem[] = [];

    const addSeparatorIfNeeded = () => {
      if (contextMenu.length) {
        contextMenu.push({
          separator: true,
        });
      }
    };

    if (node.refreshable) {
      contextMenu.push({
        icon: 'pi pi-refresh',
        label: 'Refresh',
        disabled: this.isLoading(),
        command: () => {
          this.refresh();
        },
      });
    }

    if (node.sendEndpoint) {
      addSeparatorIfNeeded();

      contextMenu.push({
        icon: 'pi pi-upload',
        label: 'Send new message',
        command: () => {
          this.sendEndpointSelected.emit(node.sendEndpoint!);
        },
      });
    }

    if (node.receiveEndpoints?.length) {
      addSeparatorIfNeeded();

      for (const receiveEndpoint of node.receiveEndpoints) {
        contextMenu.push({
          icon: 'pi pi-download',
          label: `Receive ${receiveEndpoint.displayName} messages`,
          command: () => {
            this.receiveEndpointSelected.emit(receiveEndpoint);
          },
        });
      }

      addSeparatorIfNeeded();

      for (const receiveEndpoint of node.receiveEndpoints) {
        contextMenu.push({
          icon: 'pi pi-eraser',
          label: `Clear ${receiveEndpoint.displayName} messages`,
          command: () => {
            this.clearReceiveEndpointSelected.emit(receiveEndpoint);
          },
        });
      }
    }

    if (node.actions?.length) {
      const groupedActions = Object.groupBy(
        node.actions,
        (action) => action.actionGroup ?? 'n/a',
      );
      for (const actionGroup of Object.values(groupedActions)) {
        if (!actionGroup?.length) {
          continue;
        }

        addSeparatorIfNeeded();
        for (const action of actionGroup) {
          contextMenu.push({
            icon: action.icon,
            label: action.displayName,
            command: () => {
              this.actionSelected.emit(action);
            },
          });
        }
      }
    }

    return contextMenu;
  });

  showContextMenu = computed(() => this.contextMenuItems().length > 0 && this.selectionMode() === 'actions');

  refresh($event?: MouseEvent) {
    $event?.stopPropagation();

    this.store.dispatch(
      TopologyActions.refreshTopology({
        path: this.node().path,
      }),
    );
  }
}
