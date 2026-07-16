import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SbbMenuItem } from '../menu';
import { SbbContextMenu } from './context-menu.component';

@Component({
  standalone: true,
  imports: [SbbContextMenu],
  template: `
    <sbb-context-menu [model]="model()" [data]="data">
      <span class="trigger">right-click me</span>
    </sbb-context-menu>
  `,
})
class HostComponent {
  readonly model = signal<SbbMenuItem<string>[]>([]);
  readonly data = 'queue-1';
}

describe('SbbContextMenu', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
  });

  function openMenu(): void {
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('.trigger');
    trigger.dispatchEvent(
      new MouseEvent('contextmenu', { bubbles: true, clientX: 20, clientY: 20 }),
    );
    fixture.detectChanges();
  }

  function panel(): Element | null {
    return document.querySelector('.sbb-menu-panel');
  }

  function items(): HTMLButtonElement[] {
    return Array.from(
      document.querySelectorAll<HTMLButtonElement>('.sbb-menu-panel__item'),
    );
  }

  it('opens on right-click and renders the model labels', () => {
    host.model.set([{ label: 'Refresh' }, { label: 'Delete' }]);
    openMenu();

    expect(panel()).not.toBeNull();
    expect(items().map((b) => b.textContent?.trim())).toEqual([
      'Refresh',
      'Delete',
    ]);
  });

  it('invokes onSelect with the bound data when an item is chosen', () => {
    const onSelect = jest.fn();
    host.model.set([{ label: 'Delete', onSelect }]);
    openMenu();

    items()[0].click();

    expect(onSelect).toHaveBeenCalledWith('queue-1');
  });

  it('renders separators as a rule and skips them as items', () => {
    host.model.set([
      { label: 'Refresh' },
      { separator: true },
      { label: 'Delete' },
    ]);
    openMenu();

    expect(
      document.querySelectorAll('.sbb-menu-panel__separator').length,
    ).toBe(1);
    expect(items().length).toBe(2);
  });

  it('marks disabled items and does not invoke them', () => {
    const onSelect = jest.fn();
    host.model.set([{ label: 'Delete', disabled: true, onSelect }]);
    openMenu();

    const button = items()[0];
    expect(button.getAttribute('aria-disabled')).toBe('true');

    button.click();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('renders items with submenus as expandable (caret) triggers', () => {
    host.model.set([
      {
        label: 'Move to',
        items: [{ label: 'Topic A' }, { label: 'Topic B' }],
      },
    ]);
    openMenu();

    const button = items()[0];
    expect(button.querySelector('.sbb-menu-panel__caret')).not.toBeNull();
    expect(button.getAttribute('aria-haspopup')).toBe('menu');
  });
});
