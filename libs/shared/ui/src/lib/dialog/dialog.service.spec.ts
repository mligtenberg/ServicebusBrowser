import { ApplicationRef, Component, inject, input, ChangeDetectionStrategy } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SbbDialogRef } from './dialog-ref';
import { SbbDialogService } from './dialog.service';

/** Minimal content component: renders its message input and can self-close. */
@Component({
  selector: 'sbb-test-dialog-body',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<p class="body-message">{{ message() }}</p>`,
})
class TestDialogBody {
  /** The most recently created instance, for asserting DI wiring in tests. */
  static last: TestDialogBody | undefined;

  readonly dialogRef = inject<SbbDialogRef<string>>(SbbDialogRef);
  readonly message = input('');

  constructor() {
    TestDialogBody.last = this;
  }

  confirm(value: string): void {
    this.dialogRef.close(value);
  }
}

describe('SbbDialogService', () => {
  let service: SbbDialogService;
  let appRef: ApplicationRef;

  beforeEach(() => {
    TestDialogBody.last = undefined;
    TestBed.configureTestingModule({});
    service = TestBed.inject(SbbDialogService);
    appRef = TestBed.inject(ApplicationRef);
  });

  afterEach(() => {
    document
      .querySelectorAll('.cdk-overlay-container')
      .forEach((el) => el.remove());
  });

  function tick(): void {
    appRef.tick();
  }

  it('renders the content component inside a titled container', () => {
    service.open(TestDialogBody, { title: 'Delete queue' });
    tick();

    const container = document.querySelector('sbb-dialog-container');
    expect(container).not.toBeNull();
    expect(container?.querySelector('.sbb-dialog__title')?.textContent).toContain(
      'Delete queue',
    );
    expect(container?.querySelector('sbb-test-dialog-body')).not.toBeNull();
  });

  it('applies configured inputs to the content component', () => {
    service.open(TestDialogBody, { inputs: { message: 'Are you sure?' } });
    tick();

    expect(document.querySelector('.body-message')?.textContent).toContain(
      'Are you sure?',
    );
  });

  it('resolves closed with the value the content component closes with', () => {
    const ref = service.open<TestDialogBody, string>(TestDialogBody);
    tick();

    const results: (string | undefined)[] = [];
    ref.closed.subscribe((r) => results.push(r));

    // Close through the ref injected into the content component — proving the
    // content receives the same ref the opener holds.
    TestDialogBody.last?.confirm('accepted');
    tick();

    expect(results).toEqual(['accepted']);
    expect(document.querySelector('sbb-dialog-container')).toBeNull();
  });

  it('shows a close button and dismisses with undefined when closable', () => {
    const ref = service.open(TestDialogBody, { closable: true });
    tick();

    const results: unknown[] = [];
    ref.closed.subscribe((r) => results.push(r));

    const closeButton = document.querySelector<HTMLButtonElement>(
      '.sbb-dialog__close',
    );
    expect(closeButton).not.toBeNull();
    closeButton?.click();
    tick();

    expect(results).toEqual([undefined]);
    expect(document.querySelector('sbb-dialog-container')).toBeNull();
  });

  it('omits the close button when not closable', () => {
    service.open(TestDialogBody, { closable: false, title: 'Working' });
    tick();

    expect(document.querySelector('.sbb-dialog__close')).toBeNull();
  });

  it('stacks multiple open dialogs', () => {
    service.open(TestDialogBody, { title: 'First' });
    service.open(TestDialogBody, { title: 'Second' });
    tick();

    expect(document.querySelectorAll('sbb-dialog-container').length).toBe(2);
  });
});
