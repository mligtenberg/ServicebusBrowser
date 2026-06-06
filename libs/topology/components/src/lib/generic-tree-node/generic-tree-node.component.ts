import { Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { Tooltip } from 'primeng/tooltip';
import {
  ReceiveEndpoint,
  SendEndpoint,
  TopologyNode,
} from '@service-bus-browser/api-contracts';
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
import { TopologyAction } from '@service-bus-browser/api-contracts';
import { faRotateRight } from '@fortawesome/free-solid-svg-icons';

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
  searchTerm = input<string>('');
  /**
   * When true the entire node name is highlighted as an exact-match chip hit.
   * Takes precedence over the substring highlight from `searchTerm`.
   */
  exactMatch = input<boolean>(false);

  actionSelected = output<TopologyAction>();
  sendEndpointSelected = output<SendEndpoint>();
  receiveEndpointSelected = output<ReceiveEndpoint>();
  clearReceiveEndpointSelected = output<ReceiveEndpoint>();

  /**
   * Breaks node.name into [{text, highlight}] segments for rendering.
   *
   * Priority:
   *  1. exactMatch=true  → whole name is one highlighted segment (chip hit).
   *  2. searchTerm set   → substring highlight as before.
   *  3. Neither          → plain text.
   */
  highlightParts = computed<{ text: string; highlight: boolean }[]>(() => {
    const name = this.node().name;

    // Exact-match (chip hit): highlight the entire name
    if (this.exactMatch()) {
      return [{ text: name, highlight: true }];
    }

    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return [{ text: name, highlight: false }];
    }
    const lowerName = name.toLowerCase();
    const idx = lowerName.indexOf(term);
    if (idx === -1) {
      return [{ text: name, highlight: false }];
    }
    const parts: { text: string; highlight: boolean }[] = [];
    if (idx > 0) {
      parts.push({ text: name.slice(0, idx), highlight: false });
    }
    parts.push({ text: name.slice(idx, idx + term.length), highlight: true });
    if (idx + term.length < name.length) {
      parts.push({ text: name.slice(idx + term.length), highlight: false });
    }
    return parts;
  });

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

  disableRefresh = computed(
    () => this.selectionMode() === 'none' || this.isLoading(),
  );

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
    const counts = node.availableMessageCounts.filter((e) => e.showInSummary);

    if (counts.length === 0) {
      return undefined;
    }

    return `(${counts.map((c) => `${c.count}`).join(', ')})`;
  });

  messageCountEntities = computed(() => {
    const node = this.node();
    if (!node.availableMessageCounts) {
      return undefined;
    }

    return node.availableMessageCounts;
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
        if (!receiveEndpoint.clearable) {
          continue;
        }
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

  showContextMenu = computed(
    () =>
      this.contextMenuItems().length > 0 && this.selectionMode() === 'actions',
  );

  refresh($event?: MouseEvent) {
    $event?.stopPropagation();

    this.store.dispatch(
      TopologyActions.refreshTopology({
        path: this.node().path,
      }),
    );
  }

  protected readonly faRotateRight = faRotateRight;
}
