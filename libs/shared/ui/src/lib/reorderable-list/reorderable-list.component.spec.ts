import { Component, EventEmitter, signal, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SbbReorderableList } from './reorderable-list.component';
import { SbbReorderableListItemDef } from './reorderable-list-item.directive';
import { SbbReorderableListHandle } from './reorderable-list-handle.directive';

/** Host exercises the PUBLIC API only: [items]/[orientation]/[disabled] + (reordered), row content via the projected template. */
@Component({
  imports: [SbbReorderableList, SbbReorderableListItemDef, SbbReorderableListHandle],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <sbb-reorderable-list
      [items]="items()"
      [orientation]="orientation()"
      [disabled]="disabled()"
      (reordered)="reordered.emit($event)"
    >
      <ng-template sbbReorderableListItem let-item let-i="index">
        <span sbbReorderableListHandle class="handle">::</span>
        <span class="label">{{ item }} #{{ i }}</span>
      </ng-template>
    </sbb-reorderable-list>
  `,
})
class HostComponent {
  items = signal(['one', 'two', 'three']);
  orientation = signal<'horizontal' | 'vertical'>('vertical');
  disabled = signal(false);
  reordered = new EventEmitter<{ previousIndex: number; currentIndex: number }>();
}

describe('SbbReorderableList', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let list: SbbReorderableList<unknown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    list = fixture.debugElement.query(By.directive(SbbReorderableList)).componentInstance;
  });

  function getRows(): HTMLElement[] {
    return fixture.debugElement.queryAll(By.css('.sbb-reorderable-list__item')).map((el) => el.nativeElement);
  }

  it('should render one row per item using the projected template', () => {
    const rows = getRows();
    expect(rows.length).toBe(3);
    expect(rows.map((row) => row.querySelector('.label')?.textContent?.trim())).toEqual(['one #0', 'two #1', 'three #2']);
  });

  it('should mark the drop list disabled when [disabled] is set', () => {
    host.disabled.set(true);
    fixture.detectChanges();

    const dropList = fixture.debugElement.query(By.css('.sbb-reorderable-list'));
    expect(dropList.nativeElement.classList).toContain('cdk-drop-list-disabled');
  });

  it('should not mark the drop list disabled by default', () => {
    const dropList = fixture.debugElement.query(By.css('.sbb-reorderable-list'));
    expect(dropList.nativeElement.classList).not.toContain('cdk-drop-list-disabled');
  });

  it('should emit reordered with the moved indices on drop', () => {
    const emitted: unknown[] = [];
    host.reordered.subscribe((event) => emitted.push(event));

    (list as unknown as { onDropped: (event: { previousIndex: number; currentIndex: number }) => void }).onDropped({
      previousIndex: 0,
      currentIndex: 2,
    });

    expect(emitted).toEqual([{ previousIndex: 0, currentIndex: 2 }]);
  });

  it('should not emit when the drop index is unchanged', () => {
    const emitted: unknown[] = [];
    host.reordered.subscribe((event) => emitted.push(event));

    (list as unknown as { onDropped: (event: { previousIndex: number; currentIndex: number }) => void }).onDropped({
      previousIndex: 1,
      currentIndex: 1,
    });

    expect(emitted).toEqual([]);
  });
});
