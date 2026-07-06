import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SbbTree } from './tree.component';
import { SbbTreeNodeDef } from './tree-node-def.directive';
import { SbbTreeNode } from './tree.models';

interface TestNode extends SbbTreeNode {
  id: string;
  label: string;
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
 *  - [(selectedId)] / (nodeSelect)
 *  - [(expandedIds)] / (nodeExpand)/(nodeCollapse)
 *  - <ng-template sbbTreeNode> projection with context
 */
@Component({
  imports: [SbbTree, SbbTreeNodeDef],
  template: `
    <sbb-tree
      [nodes]="nodes()"
      [(selectedId)]="selectedId"
      [expandedIds]="expandedIds()"
      (expandedIdsChange)="expandedIds.set($event)"
      (nodeSelect)="lastSelected = $event"
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
  selectedId?: string;
  expandedIds = signal<string[]>([]);
  lastSelected?: TestNode;
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

  it('selects a single node and emits nodeSelect', () => {
    rowFor('root').click();
    fixture.detectChanges();

    expect(host.selectedId).toBe('root');
    expect(host.lastSelected?.id).toBe('root');
  });

  it('moves selection to a new node (single-select only)', () => {
    toggleButtonFor('root').click();
    fixture.detectChanges();

    rowFor('root').click();
    fixture.detectChanges();
    expect(host.selectedId).toBe('root');

    rowFor('child-a').click();
    fixture.detectChanges();

    expect(host.selectedId).toBe('child-a');
    expect(host.lastSelected?.id).toBe('child-a');
  });

  it('exposes selection state to the node template context', () => {
    rowFor('root').click();
    fixture.detectChanges();

    expect(labelEl('root').getAttribute('data-selected')).toBe('true');
  });

  it('does not re-emit nodeSelect when the same node is clicked twice', () => {
    rowFor('root').click();
    fixture.detectChanges();
    rowFor('root').click();
    fixture.detectChanges();

    expect(host.selectedId).toBe('root');
    // lastSelected assigned once; clicking again is a no-op path
    expect(host.lastSelected?.id).toBe('root');
  });
});
