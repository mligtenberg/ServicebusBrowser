import { Component, EventEmitter, signal, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SbbTabs } from './tabs.component';
import { SbbTabPanel } from './tab-panel.component';
import { SbbTabHeaderDef } from './tab-header.directive';

/** Host exercises the PUBLIC API only: [orientation]/[(value)] on the group, value/label/disabled per panel. */
@Component({
  imports: [SbbTabs, SbbTabPanel],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <sbb-tabs [orientation]="orientation()" [(value)]="value">
      <sbb-tab-panel value="one" label="One">
        <div class="panel-body">First panel</div>
      </sbb-tab-panel>
      <sbb-tab-panel value="two" label="Two" [disabled]="twoDisabled()">
        <div class="panel-body">Second panel</div>
      </sbb-tab-panel>
      <sbb-tab-panel value="three" label="Three">
        <div class="panel-body">Third panel</div>
      </sbb-tab-panel>
    </sbb-tabs>
  `,
})
class HostComponent {
  orientation = signal<'horizontal' | 'vertical'>('horizontal');
  value = signal<string | undefined>(undefined);
  twoDisabled = signal(false);
}

describe('SbbTabs + SbbTabPanel', () => {
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

  function getTabs(): HTMLButtonElement[] {
    return fixture.debugElement.queryAll(By.css('.sbb-tabs__tab')).map((el) => el.nativeElement);
  }

  function getPanels(): HTMLElement[] {
    return fixture.debugElement.queryAll(By.css('.sbb-tab-panel')).map((el) => el.nativeElement);
  }

  it('should create a tab per panel', () => {
    expect(getTabs().length).toBe(3);
    expect(getTabs().map((tab) => tab.textContent?.trim())).toEqual(['One', 'Two', 'Three']);
  });

  it('should default-select the first non-disabled panel', () => {
    expect(host.value()).toBe('one');
    expect(getTabs()[0].getAttribute('aria-selected')).toBe('true');
    expect(getPanels()[0].hidden).toBe(false);
    expect(getPanels()[1].hidden).toBe(true);
  });

  it('should select a tab on click, updating the two-way bound `value`', () => {
    getTabs()[2].click();
    fixture.detectChanges();

    expect(host.value()).toBe('three');
    expect(getTabs()[2].getAttribute('aria-selected')).toBe('true');
    expect(getPanels()[2].hidden).toBe(false);
    expect(getPanels()[0].hidden).toBe(true);
  });

  it('should not select a disabled tab on click', () => {
    host.twoDisabled.set(true);
    fixture.detectChanges();

    getTabs()[1].click();
    fixture.detectChanges();

    expect(host.value()).toBe('one');
  });

  it('should link each tab to its panel via aria-controls/aria-labelledby', () => {
    const tab = getTabs()[0];
    const panel = getPanels()[0];
    expect(tab.getAttribute('aria-controls')).toBe(panel.id);
    expect(panel.getAttribute('aria-labelledby')).toBe(tab.id);
  });

  it('should move selection to the next tab on ArrowRight, skipping disabled tabs', () => {
    host.twoDisabled.set(true);
    fixture.detectChanges();

    getTabs()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();

    expect(host.value()).toBe('three');
  });

  it('should wrap around and jump to the ends with Home/End', () => {
    getTabs()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    fixture.detectChanges();
    expect(host.value()).toBe('three');

    getTabs()[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(host.value()).toBe('one');

    getTabs()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    fixture.detectChanges();
    expect(host.value()).toBe('one');
  });

  it('should ignore vertical-only keys in horizontal orientation', () => {
    getTabs()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();

    expect(host.value()).toBe('one');
  });

  it('should mark the drop list disabled when not reorderable (the default)', () => {
    const list = fixture.debugElement.query(By.css('.sbb-tabs__list'));
    expect(list.nativeElement.classList).toContain('cdk-drop-list-disabled');
  });
});

@Component({
  imports: [SbbTabs, SbbTabPanel],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <sbb-tabs [(value)]="value" [reorderable]="true" (reordered)="reordered.emit($event)">
      <sbb-tab-panel value="one" label="One">
        <div class="panel-body">First panel</div>
      </sbb-tab-panel>
      <sbb-tab-panel value="two" label="Two" [dragDisabled]="twoDragDisabled()">
        <div class="panel-body">Second panel</div>
      </sbb-tab-panel>
    </sbb-tabs>
  `,
})
class ReorderableHostComponent {
  value = signal<string | undefined>(undefined);
  twoDragDisabled = signal(false);
  reordered = new EventEmitter<{ previousIndex: number; currentIndex: number }>();
}

describe('SbbTabs reordering', () => {
  let fixture: ComponentFixture<ReorderableHostComponent>;
  let host: ReorderableHostComponent;
  let tabs: SbbTabs;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReorderableHostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ReorderableHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    tabs = fixture.debugElement.query(By.directive(SbbTabs)).componentInstance;
  });

  it('should enable the drop list once reorderable', () => {
    const list = fixture.debugElement.query(By.css('.sbb-tabs__list'));
    expect(list.nativeElement.classList).not.toContain('cdk-drop-list-disabled');
  });

  it('should emit reordered with the moved indices on drop', () => {
    const emitted: unknown[] = [];
    host.reordered.subscribe((event) => emitted.push(event));

    (tabs as unknown as { onReordered: (event: { previousIndex: number; currentIndex: number }) => void }).onReordered({
      previousIndex: 0,
      currentIndex: 1,
    });

    expect(emitted).toEqual([{ previousIndex: 0, currentIndex: 1 }]);
  });

  it('should not emit when the drop index is unchanged', () => {
    const emitted: unknown[] = [];
    host.reordered.subscribe((event) => emitted.push(event));

    (tabs as unknown as { onReordered: (event: { previousIndex: number; currentIndex: number }) => void }).onReordered({
      previousIndex: 1,
      currentIndex: 1,
    });

    expect(emitted).toEqual([]);
  });
});

@Component({
  imports: [SbbTabs, SbbTabPanel, SbbTabHeaderDef],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <sbb-tabs [(value)]="value">
      <sbb-tab-panel value="one" label="One">
        <ng-template sbbTabHeader>
          <span class="custom-label">One</span>
          <button type="button" class="close-button" (click)="closed.set('one'); $event.stopPropagation()">
            x
          </button>
        </ng-template>
        <div class="panel-body">First panel</div>
      </sbb-tab-panel>
      <sbb-tab-panel value="two" label="Two">
        <div class="panel-body">Second panel</div>
      </sbb-tab-panel>
    </sbb-tabs>
  `,
})
class CustomHeaderHostComponent {
  value = signal<string | undefined>(undefined);
  closed = signal<string | undefined>(undefined);
}

describe('SbbTabs with a custom sbbTabHeader', () => {
  let fixture: ComponentFixture<CustomHeaderHostComponent>;
  let host: CustomHeaderHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomHeaderHostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(CustomHeaderHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render the projected header content instead of a plain label', () => {
    const tab = fixture.debugElement.query(By.css('.sbb-tabs__tab--custom'));
    expect(tab.nativeElement.tagName).toBe('DIV');
    // The wrapper is presentational; the WAI-ARIA "tab" is a dedicated,
    // focusable child so the projected header's controls aren't nested inside
    // a focusable "tab" element ("nested-interactive").
    expect(tab.nativeElement.getAttribute('role')).toBe('presentation');
    const tabRole = tab.query(By.css('[role="tab"]'));
    expect(tabRole.nativeElement.tagName).toBe('DIV');
    expect(tab.query(By.css('.custom-label')).nativeElement.textContent.trim()).toBe('One');
  });

  it('should let an interactive element inside the header handle its own click without selecting the tab', () => {
    fixture.debugElement.query(By.css('.close-button')).nativeElement.click();
    fixture.detectChanges();

    expect(host.closed()).toBe('one');
  });

  it('should still select the custom-header tab on click of the tab itself', () => {
    const secondTab = fixture.debugElement.queryAll(By.css('.sbb-tabs__tab'))[1];
    secondTab.nativeElement.click();
    fixture.detectChanges();

    expect(host.value()).toBe('two');
  });
});
