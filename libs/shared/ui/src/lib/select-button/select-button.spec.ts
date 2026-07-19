import { ApplicationRef, Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { SbbSelectOption } from '../select';
import { SbbSelectButton } from './select-button';

@Component({
  standalone: true,
  imports: [SbbSelectButton, FormsModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <sbb-select-button
      [options]="options()"
      [(ngModel)]="value"
      [disabled]="disabled()"
      [size]="size()"
    />
  `,
})
class HostComponent {
  readonly options = signal<readonly SbbSelectOption<string>[] | readonly string[]>(
    [],
  );
  readonly disabled = signal(false);
  readonly size = signal<'small' | 'medium'>('medium');
  value: string | null = null;
}

describe('SbbSelectButton', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let appRef: ApplicationRef;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    appRef = TestBed.inject(ApplicationRef);
  });

  function options(): HTMLButtonElement[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll<HTMLButtonElement>(
        '.sbb-select-button__option',
      ),
    );
  }

  async function flush(): Promise<void> {
    fixture.detectChanges();
    await Promise.resolve();
    appRef.tick();
  }

  it('renders one button per plain-value option, labelled by the value', async () => {
    host.options.set(['raw', 'pretty']);
    await flush();

    expect(options().map((b) => b.textContent?.trim())).toEqual([
      'raw',
      'pretty',
    ]);
  });

  it('renders object options using their label', async () => {
    host.options.set([
      { label: 'Raw', value: 'raw' },
      { label: 'Pretty', value: 'pretty' },
    ]);
    await flush();

    expect(options().map((b) => b.textContent?.trim())).toEqual([
      'Raw',
      'Pretty',
    ]);
  });

  it('reflects the ngModel value as the selected (data-state="on") button', async () => {
    host.options.set(['raw', 'pretty']);
    host.value = 'pretty';
    await flush();

    expect(options()[0].getAttribute('data-state')).toBe('off');
    expect(options()[1].getAttribute('data-state')).toBe('on');
  });

  it('writes the chosen value back through ngModel when a button is clicked', async () => {
    host.options.set(['raw', 'pretty']);
    await flush();

    options()[1].click();
    await flush();

    expect(host.value).toBe('pretty');
    expect(options()[1].getAttribute('data-state')).toBe('on');
  });

  it('disables every option when disabled is set', async () => {
    host.options.set(['raw', 'pretty']);
    host.disabled.set(true);
    await flush();

    expect(options().every((b) => b.disabled)).toBe(true);
  });

  it('applies the size to the group for styling', async () => {
    host.options.set(['raw']);
    host.size.set('small');
    await flush();

    const group = fixture.nativeElement.querySelector('.sbb-select-button');
    expect(group.getAttribute('data-size')).toBe('small');
  });
});
