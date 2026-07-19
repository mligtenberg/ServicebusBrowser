import { ApplicationRef, Component, signal, TemplateRef, viewChild, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SbbMenuItem, SbbMenuPanelContext } from '../menu';
import { SbbMenubar } from './menubar.component';

@Component({
  standalone: true,
  imports: [SbbMenubar],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <sbb-menubar [model]="model()">
      <span sbbMenubarStart class="start-slot">start</span>
      <span sbbMenubarEnd class="end-slot">end</span>
    </sbb-menubar>

    <ng-template #customTrigger>
      <span class="custom-trigger">Custom</span>
    </ng-template>
    <ng-template #customPanel let-close>
      <div class="custom-panel">Custom panel content</div>
      <button type="button" class="custom-panel-close" (click)="close()">
        Close
      </button>
    </ng-template>
  `,
})
class HostComponent {
  readonly customTriggerTpl = viewChild.required<TemplateRef<void>>('customTrigger');
  readonly customPanelTpl =
    viewChild.required<TemplateRef<SbbMenuPanelContext>>('customPanel');

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

  it('renders a custom triggerTemplate instead of the default label', async () => {
    host.model.set([
      {
        triggerTemplate: host.customTriggerTpl(),
        panelTemplate: host.customPanelTpl(),
      },
      { label: 'Edit', items: [{ label: 'Undo' }] },
    ]);
    await flush();

    const trigger = barItems()[0];
    expect(trigger.querySelector('.custom-trigger')).not.toBeNull();
    expect(trigger.textContent?.trim()).toBe('Custom');
  });

  it('renders custom panelTemplate content instead of the default items list', async () => {
    host.model.set([
      {
        triggerTemplate: host.customTriggerTpl(),
        panelTemplate: host.customPanelTpl(),
      },
    ]);
    await flush();

    barItems()[0].click();
    await flush();

    expect(
      document.querySelector('.custom-panel')?.textContent?.trim(),
    ).toBe('Custom panel content');
  });

  it('closes a custom panelTemplate via its close() context, without needing cdkMenuItem', async () => {
    // Regression: a panelTemplate is declared outside SbbMenubar's own
    // component tree, so a CdkMenuItem inside it can't find the ambient
    // cdk-menu-stack token (NG0201) — closing must go through the `close`
    // template-context callback instead. This exercises exactly that path.
    host.model.set([
      {
        triggerTemplate: host.customTriggerTpl(),
        panelTemplate: host.customPanelTpl(),
      },
    ]);
    await flush();

    barItems()[0].click();
    await flush();
    expect(document.querySelector('.custom-panel')).not.toBeNull();

    const closeBtn = document.querySelector<HTMLButtonElement>(
      '.custom-panel-close',
    );
    expect(closeBtn).not.toBeNull();
    closeBtn?.click();
    await flush();

    expect(document.querySelector('.custom-panel')).toBeNull();
  });

  it('opens the next sibling on hover once a menu is already open (hover-to-switch)', async () => {
    host.model.set([
      { label: 'File', items: [{ label: 'New' }] },
      {
        triggerTemplate: host.customTriggerTpl(),
        panelTemplate: host.customPanelTpl(),
      },
    ]);
    await flush();

    const [fileItem, customItem] = barItems();

    fileItem.click();
    await flush();
    expect(document.querySelector('.sbb-menu-panel')).not.toBeNull();
    expect(document.querySelector('.custom-panel')).toBeNull();

    customItem.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await flush();

    expect(document.querySelector('.custom-panel')).not.toBeNull();
    // The previous panel's content is gone — File's submenu closed when the
    // custom item's panel opened, matching a native menubar's hover-switch.
    expect(
      Array.from(document.querySelectorAll('.sbb-menu-panel__item')).some(
        (el) => el.textContent?.trim() === 'New',
      ),
    ).toBe(false);
  });
});
