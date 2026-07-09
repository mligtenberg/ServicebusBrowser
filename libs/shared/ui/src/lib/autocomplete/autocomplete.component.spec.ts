import { ApplicationRef, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { SbbAutocomplete } from './autocomplete.component';
import { SbbAutocompleteGroup } from './autocomplete.models';

@Component({
  standalone: true,
  imports: [SbbAutocomplete, FormsModule],
  template: `
    <sbb-autocomplete
      [(ngModel)]="value"
      [suggestions]="suggestions()"
      [groups]="groups()"
      [minLength]="minLength()"
      (completeChange)="lastQuery = $event"
      (selected)="lastSelected = $event"
      (cleared)="clears = clears + 1"
    />
  `,
})
class HostComponent {
  readonly suggestions = signal<readonly string[]>([]);
  readonly groups = signal<readonly SbbAutocompleteGroup<string>[] | null>(null);
  readonly minLength = signal(1);
  value: string | null = null;
  lastQuery: string | null = null;
  lastSelected: string | null = null;
  clears = 0;
}

describe('SbbAutocomplete', () => {
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

  function input(): HTMLInputElement {
    return fixture.nativeElement.querySelector('.sbb-autocomplete__input');
  }

  async function type(text: string): Promise<void> {
    const el = input();
    el.value = text;
    el.dispatchEvent(new Event('input'));
    await flush();
  }

  function options(): HTMLButtonElement[] {
    return Array.from(
      document.querySelectorAll<HTMLButtonElement>(
        '.sbb-autocomplete-panel__option',
      ),
    );
  }

  it('emits completeChange and opens the panel with suggestions as the user types', async () => {
    host.suggestions.set(['alpha', 'beta']);
    await flush();

    await type('a');

    expect(host.lastQuery).toBe('a');
    expect(options().map((b) => b.textContent?.trim())).toEqual([
      'alpha',
      'beta',
    ]);
  });

  it('keeps free text as the value (forceSelection defaults to false)', async () => {
    host.suggestions.set(['alpha']);
    await flush();

    await type('xyz');

    expect(host.value).toBe('xyz');
  });

  it('writes the chosen suggestion through ngModel, emits selected, and closes', async () => {
    host.suggestions.set(['alpha', 'beta']);
    await flush();
    await type('a');

    options()[1].click();
    await flush();

    expect(host.value).toBe('beta');
    expect(host.lastSelected).toBe('beta');
    expect(options().length).toBe(0);
  });

  it('emits cleared when the field is emptied', async () => {
    host.suggestions.set(['alpha']);
    await flush();
    await type('a');

    await type('');

    expect(host.clears).toBe(1);
    expect(host.value).toBeNull();
  });

  it('renders grouped suggestions with their group labels', async () => {
    host.groups.set([
      { label: 'Queues', items: ['q1', 'q2'] },
      { label: 'Topics', items: ['t1'] },
    ]);
    await flush();
    await type('q');

    const labels = Array.from(
      document.querySelectorAll('.sbb-autocomplete-panel__group-label'),
    ).map((el) => el.textContent?.trim());
    expect(labels).toEqual(['Queues', 'Topics']);
    expect(options().length).toBe(3);
  });

  it('does not open below minLength', async () => {
    host.suggestions.set(['alpha']);
    host.minLength.set(2);
    await flush();

    await type('a');

    expect(options().length).toBe(0);
  });
});
