import { ApplicationRef, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SbbMenuItem } from '../menu';
import { SbbMenubar } from './menubar.component';

@Component({
  standalone: true,
  imports: [SbbMenubar],
  template: `
    <sbb-menubar [model]="model()">
      <span sbbMenubarStart class="start-slot">start</span>
      <span sbbMenubarEnd class="end-slot">end</span>
    </sbb-menubar>
  `,
})
class HostComponent {
  readonly model = signal<SbbMenuItem<void>[]>([]);
}

describe('SbbMenubar', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let appRef: ApplicationRef;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    appRef = TestBed.inject(ApplicationRef);
  });

  afterEach(() => {
    document
      .querySelectorAll('.cdk-overlay-container')
      .forEach((el) => el.remove());
  });

  async function flush(): Promise<void> {
    fixture.detectChanges();
    await Promise.resolve();
    appRef.tick();
  }

  function barItems(): HTMLButtonElement[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll<HTMLButtonElement>(
        '.sbb-menubar__item',
      ),
    );
  }

  it('renders the top-level item labels', async () => {
    host.model.set([{ label: 'File' }, { label: 'Edit' }]);
    await flush();

    expect(barItems().map((b) => b.textContent?.trim())).toEqual([
      'File',
      'Edit',
    ]);
  });

  it('projects the start and end slots', async () => {
    host.model.set([{ label: 'File' }]);
    await flush();

    expect(fixture.nativeElement.querySelector('.start-slot')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.end-slot')).not.toBeNull();
  });

  it('invokes onSelect for a leaf top-level item', async () => {
    const onSelect = jest.fn();
    host.model.set([{ label: 'Refresh', onSelect }]);
    await flush();

    barItems()[0].click();
    await flush();

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('opens a submenu for an item with children', async () => {
    host.model.set([
      { label: 'File', items: [{ label: 'New' }, { label: 'Open' }] },
    ]);
    await flush();

    const fileItem = barItems()[0];
    expect(fileItem.getAttribute('aria-haspopup')).toBe('menu');

    fileItem.click();
    await flush();

    const submenuItems = Array.from(
      document.querySelectorAll<HTMLButtonElement>('.sbb-menu-panel__item'),
    );
    expect(submenuItems.map((b) => b.textContent?.trim())).toEqual([
      'New',
      'Open',
    ]);
  });
});
