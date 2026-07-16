import { ApplicationRef, Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SbbMenuItem } from '../menu';
import { SbbMenu } from './popup-menu.component';

@Component({
  standalone: true,
  imports: [SbbMenu],
  template: `
    <button #trigger type="button" (click)="menu().open($event)">open</button>
    <sbb-menu [model]="model()" [data]="data" />
  `,
})
class HostComponent {
  readonly menu = viewChild.required(SbbMenu);
  readonly model = signal<SbbMenuItem<string>[]>([]);
  readonly data = 'queue-1';
}

describe('SbbMenu', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let appRef: ApplicationRef;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    appRef = TestBed.inject(ApplicationRef);
  });

  async function openMenu(): Promise<void> {
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();
    await Promise.resolve();
    appRef.tick();
  }

  function panel(): Element | null {
    return document.querySelector('.sbb-menu-panel');
  }

  function items(): HTMLButtonElement[] {
    return Array.from(
      document.querySelectorAll<HTMLButtonElement>('.sbb-menu-panel__item'),
    );
  }

  it('opens on open() and renders the model labels', async () => {
    host.model.set([{ label: 'Refresh' }, { label: 'Delete' }]);
    await openMenu();

    expect(panel()).not.toBeNull();
    expect(items().map((b) => b.textContent?.trim())).toEqual([
      'Refresh',
      'Delete',
    ]);
  });

  it('invokes onSelect with the bound data and closes', async () => {
    const onSelect = jest.fn();
    host.model.set([{ label: 'Delete', onSelect }]);
    await openMenu();

    items()[0].click();
    await Promise.resolve();
    appRef.tick();

    expect(onSelect).toHaveBeenCalledWith('queue-1');
    expect(panel()).toBeNull();
  });

  it('renders separators as a rule and skips them as items', async () => {
    host.model.set([
      { label: 'Refresh' },
      { separator: true },
      { label: 'Delete' },
    ]);
    await openMenu();

    expect(
      document.querySelectorAll('.sbb-menu-panel__separator').length,
    ).toBe(1);
    expect(items().length).toBe(2);
  });

  it('marks disabled items and does not invoke them', async () => {
    const onSelect = jest.fn();
    host.model.set([{ label: 'Delete', disabled: true, onSelect }]);
    await openMenu();

    const button = items()[0];
    expect(button.getAttribute('aria-disabled')).toBe('true');

    button.click();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('renders items with submenus as expandable triggers', async () => {
    host.model.set([
      { label: 'Move to', items: [{ label: 'Topic A' }, { label: 'Topic B' }] },
    ]);
    await openMenu();

    const button = items()[0];
    expect(button.querySelector('.sbb-menu-panel__caret')).not.toBeNull();
    expect(button.getAttribute('aria-haspopup')).toBe('menu');
  });

  it('closes on close()', async () => {
    host.model.set([{ label: 'Refresh' }]);
    await openMenu();
    expect(panel()).not.toBeNull();

    host.menu().close();
    await Promise.resolve();
    appRef.tick();

    expect(panel()).toBeNull();
  });
});
