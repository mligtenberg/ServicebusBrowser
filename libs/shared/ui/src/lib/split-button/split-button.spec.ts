import { ApplicationRef, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SbbMenuItem } from '../menu';
import { SbbSplitButton } from './split-button';

@Component({
  standalone: true,
  imports: [SbbSplitButton],
  template: `
    <sbb-split-button
      [label]="label()"
      [model]="model()"
      [disabled]="disabled()"
      (clicked)="onClicked()"
    />
  `,
})
class HostComponent {
  readonly label = signal('Send batch');
  readonly model = signal<SbbMenuItem<void>[]>([]);
  readonly disabled = signal(false);
  readonly clicks = signal(0);
  onClicked(): void {
    this.clicks.update((n) => n + 1);
  }
}

describe('SbbSplitButton', () => {
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

  function primaryButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector(
      '.sbb-split-button__primary button',
    );
  }

  function toggleButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector(
      '.sbb-split-button__toggle button',
    );
  }

  function panelItems(): HTMLButtonElement[] {
    return Array.from(
      document.querySelectorAll<HTMLButtonElement>(
        '.sbb-split-button-panel__item',
      ),
    );
  }

  it('renders the primary label', async () => {
    await flush();
    expect(primaryButton().textContent?.trim()).toBe('Send batch');
  });

  it('emits clicked when the primary button is pressed', async () => {
    await flush();

    primaryButton().click();
    await flush();

    expect(host.clicks()).toBe(1);
  });

  it('opens the dropdown with the model items', async () => {
    host.model.set([{ label: 'Send selection' }, { label: 'Send all' }]);
    await flush();

    toggleButton().click();
    await flush();

    expect(panelItems().map((b) => b.textContent?.trim())).toEqual([
      'Send selection',
      'Send all',
    ]);
  });

  it('invokes the chosen dropdown item onSelect', async () => {
    const onSelect = jest.fn();
    host.model.set([{ label: 'Send selection', onSelect }]);
    await flush();

    toggleButton().click();
    await flush();

    panelItems()[0].click();
    await flush();

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('disables both buttons when disabled is set', async () => {
    host.model.set([{ label: 'Send selection' }]);
    host.disabled.set(true);
    await flush();

    expect(primaryButton().disabled).toBe(true);
    expect(toggleButton().disabled).toBe(true);
  });
});
