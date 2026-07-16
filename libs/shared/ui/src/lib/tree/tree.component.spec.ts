import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SbbTree, SbbTreeSelectionMode } from './tree.component';
import { SbbTreeNodeDef } from './tree-node-def.directive';
import { SbbTreeNode } from './tree.models';

interface TestNode extends SbbTreeNode {
  id: string;
  label: string;
  type?: string;
  selectable?: boolean;
  children?: TestNode[];
}

const DATA: TestNode[] = [
  {
    id: 'root',
    label: 'Root',
    children: [
      { id: 'child-a', label: 'Child A' },
      {
        id: 'child-b',
        label: 'Child B',
        children: [{ id: 'grandchild', label: 'Grandchild' }],
      },
    ],
  },
];

/**
 * Host exercises the PUBLIC API only:
 *  - [nodes] input
 *  - [selectionMode], [(selectedIds)], (selectionChange), (nodeSelect)
 *  - [rangeFilter]
 *  - [(expandedIds)] / (nodeExpand)/(nodeCollapse)
 *  - <ng-template sbbTreeNode> projection with context
 */
@Component({
  imports: [SbbTree, SbbTreeNodeDef],
  template: `
    <sbb-tree
      [nodes]="nodes()"
      [selectionMode]="selectionMode()"
      [selectedIds]="selectedIds()"
      [rangeFilter]="rangeFilter()"
      (selectedIdsChange)="selectedIds.set($event)"
      [expandedIds]="expandedIds()"
      (expandedIdsChange)="expandedIds.set($event)"
      (selectionChange)="lastSelection = $event"
      (nodeSelect)="lastSelected = $event; nodeSelectCount = nodeSelectCount + 1"
      (nodeExpand)="expandEvents.push($event)"
      (nodeCollapse)="collapseEvents.push($event)"
    >
      <ng-template sbbTreeNode let-node let-selected="selected">
        <span
          class="node-label"
          [attr.data-id]="node.id"
          [attr.data-selected]="selected"
          >{{ node.label }}</span
        >
      </ng-template>
    </sbb-tree>
  `,
})
class HostComponent {
  nodes = signal<TestNode[]>(DATA);
  selectionMode = signal<SbbTreeSelectionMode>('single');
  selectedIds = signal<readonly string[]>([]);
  rangeFilter = signal<((c: TestNode, t: TestNode) => boolean) | undefined>(
    undefined,
  );
  expandedIds = signal<string[]>([]);
  lastSelection: TestNode[] = [];
  lastSelected?: TestNode;
  nodeSelectCount = 0;
  expandEvents: TestNode[] = [];
  collapseEvents: TestNode[] = [];
}

describe('SbbTree', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  const labels = () =>
    fixture.debugElement
      .queryAll(By.css('.node-label'))
      .map((d) => (d.nativeElement as HTMLElement).getAttribute('data-id'));

  const labelEl = (id: string): HTMLElement => {
    const label = fixture.debugElement
      .queryAll(By.css('.node-label'))
      .find((d) => d.nativeElement.getAttribute('data-id') === id);
    if (!label) {
      throw new Error(`No node label found for id "${id}"`);
    }
    return label.nativeElement as HTMLElement;
  };

  const rowFor = (id: string): HTMLElement => {
    const row = labelEl(id).closest('.sbb-tree__row');
    if (!(row instanceof HTMLElement)) {
      throw new Error(`No row found for id "${id}"`);
    }
    return row;
  };

  const toggleButtonFor = (id: string): HTMLButtonElement => {
    const toggle = rowFor(id).querySelector('.sbb-tree__toggle');
    if (!(toggle instanceof HTMLButtonElement)) {
      throw new Error(`No toggle button found for id "${id}"`);
    }
    return toggle;
  };

  const clickRow = (
    id: string,
    modifiers: { shiftKey?: boolean; ctrlKey?: boolean; metaKey?: boolean } = {},
  ) => {
    rowFor(id).dispatchEvent(
      new MouseEvent('click', { bubbles: true, ...modifiers }),
    );
    fixture.detectChanges();
  };

  // ── Expansion ─────────────────────────────────────────────────────────────

  it('renders the projected template for root nodes', () => {
    expect(labels()).toEqual(['root']);
  });

  it('expands a node to reveal its children on toggle', () => {
    toggleButtonFor('root').click();
    fixture.detectChanges();

    expect(labels()).toEqual(['root', 'child-a', 'child-b']);
    expect(host.expandedIds()).toContain('root');
    expect(host.expandEvents.map((n) => n.id)).toEqual(['root']);
  });

  it('collapses an expanded node on second toggle', () => {
    toggleButtonFor('root').click();
    fixture.detectChanges();
    expect(labels()).toEqual(['root', 'child-a', 'child-b']);

    toggleButtonFor('root').click();
    fixture.detectChanges();

    expect(labels()).toEqual(['root']);
    expect(host.expandedIds()).not.toContain('root');
    expect(host.collapseEvents.map((n) => n.id)).toEqual(['root']);
  });

  it('expands nested levels independently', () => {
    toggleButtonFor('root').click();
    fixture.detectChanges();
    toggleButtonFor('child-b').click();
    fixture.detectChanges();

    expect(labels()).toEqual(['root', 'child-a', 'child-b', 'grandchild']);
    expect(host.expandedIds()).toEqual(
      expect.arrayContaining(['root', 'child-b']),
    );
  });

  it('reflects programmatic expandedIds input into the DOM', () => {
    host.expandedIds.set(['root']);
    fixture.detectChanges();

    expect(labels()).toEqual(['root', 'child-a', 'child-b']);
  });

  it('refreshes children when a same-id parent gets a new child set', () => {
    host.expandedIds.set(['root']);
    fixture.detectChanges();
    expect(labels()).toEqual(['root', 'child-a', 'child-b']);

    // Rebuild the array (as topology does on every filter) keeping id "root".
    host.nodes.set([
      {
        id: 'root',
        label: 'Root',
        children: [{ id: 'only', label: 'Only' }],
      },
    ]);
    fixture.detectChanges();

    expect(labels()).toEqual(['root', 'only']);
  });

  // ── Single selection ────────────────────────────────────────────────────

  it('selects a single node and emits nodeSelect + selectionChange', () => {
    clickRow('root');

    expect(host.selectedIds()).toEqual(['root']);
    expect(host.lastSelected?.id).toBe('root');
    expect(host.lastSelection.map((n) => n.id)).toEqual(['root']);
  });

  it('moves selection to a new node (single-select replaces)', () => {
    host.expandedIds.set(['root']);
    fixture.detectChanges();

    clickRow('root');
    expect(host.selectedIds()).toEqual(['root']);

    clickRow('child-a');
    expect(host.selectedIds()).toEqual(['child-a']);
    expect(host.lastSelected?.id).toBe('child-a');
  });

  it('exposes selection state to the node template context', () => {
    clickRow('root');

    expect(labelEl('root').getAttribute('data-selected')).toBe('true');
  });

  it('does not re-emit nodeSelect when the same node is clicked twice', () => {
    clickRow('root');
    clickRow('root');

    expect(host.selectedIds()).toEqual(['root']);
    expect(host.nodeSelectCount).toBe(1);
  });

  // ── Multi selection ───────────────────────────────────────────────────────

  it('sets aria-multiselectable only in multiple mode', () => {
    const tree = () =>
      fixture.debugElement
        .query(By.css('.sbb-tree'))
        .nativeElement.getAttribute('aria-multiselectable');
    expect(tree()).toBeNull();

    host.selectionMode.set('multiple');
    fixture.detectChanges();
    expect(tree()).toBe('true');
  });

  it('Ctrl/Cmd-click toggles individual nodes in multiple mode', () => {
    host.selectionMode.set('multiple');
    host.expandedIds.set(['root']);
    fixture.detectChanges();

    clickRow('child-a');
    clickRow('child-b', { ctrlKey: true });
    expect(host.selectedIds()).toEqual(['child-a', 'child-b']);

    clickRow('child-a', { ctrlKey: true });
    expect(host.selectedIds()).toEqual(['child-b']);
  });

  it('plain click replaces the multi-selection', () => {
    host.selectionMode.set('multiple');
    host.expandedIds.set(['root']);
    fixture.detectChanges();

    clickRow('child-a', { ctrlKey: true });
    clickRow('child-b', { ctrlKey: true });
    expect(host.selectedIds()).toEqual(['child-a', 'child-b']);

    clickRow('root');
    expect(host.selectedIds()).toEqual(['root']);
  });

  it('Shift-click extends the selection over the visible flattened range', () => {
    host.selectionMode.set('multiple');
    host.expandedIds.set(['root', 'child-b']);
    fixture.detectChanges();
    // visible order: root, child-a, child-b, grandchild

    clickRow('root');
    clickRow('grandchild', { shiftKey: true });

    expect(host.selectedIds()).toEqual([
      'root',
      'child-a',
      'child-b',
      'grandchild',
    ]);
  });

  it('rangeFilter restricts which nodes a shift-range includes', () => {
    host.nodes.set([
      {
        id: 'root',
        label: 'Root',
        type: 'folder',
        children: [
          { id: 'q1', label: 'Q1', type: 'queue' },
          { id: 't1', label: 'T1', type: 'topic' },
          { id: 'q2', label: 'Q2', type: 'queue' },
        ],
      },
    ]);
    host.selectionMode.set('multiple');
    host.rangeFilter.set((c, t) => c.type === t.type);
    fixture.detectChanges();
    host.expandedIds.set(['root']);
    fixture.detectChanges();
    // visible order: root(folder), q1(queue), t1(topic), q2(queue)

    clickRow('q1');
    clickRow('q2', { shiftKey: true });

    // Only same-type (queue) nodes in the range are added; t1/root excluded.
    expect(host.selectedIds()).toEqual(['q1', 'q2']);
  });

  // ── Selectability ─────────────────────────────────────────────────────────

  it('does not select a non-selectable node', () => {
    host.nodes.set([
      { id: 'root', label: 'Root', selectable: false },
    ]);
    fixture.detectChanges();

    clickRow('root');

    expect(host.selectedIds()).toEqual([]);
    expect(host.nodeSelectCount).toBe(0);
    expect(rowFor('root').classList).toContain('sbb-tree__row--unselectable');
  });

  it('skips non-selectable nodes inside a shift-range', () => {
    host.nodes.set([
      {
        id: 'root',
        label: 'Root',
        children: [
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B', selectable: false },
          { id: 'c', label: 'C' },
        ],
      },
    ]);
    host.selectionMode.set('multiple');
    fixture.detectChanges();
    host.expandedIds.set(['root']);
    fixture.detectChanges();

    clickRow('a');
    clickRow('c', { shiftKey: true });

    expect(host.selectedIds()).toEqual(['a', 'c']);
  });
});
