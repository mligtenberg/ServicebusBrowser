import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SbbToastService } from './toast.service';

/** Waits real wall-clock time — this suite runs zoneless, without fakeAsync. */
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('SbbToastService', () => {
  let service: SbbToastService;
  let appRef: ApplicationRef;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SbbToastService);
    appRef = TestBed.inject(ApplicationRef);
  });

  afterEach(() => {
    service.clear();
    document
      .querySelectorAll('.cdk-overlay-container')
      .forEach((el) => el.remove());
  });

  function toastEls(): NodeListOf<Element> {
    appRef.tick();
    return document.querySelectorAll('.sbb-toast');
  }

  it('renders a shown toast with its summary, detail and severity', () => {
    service.show({
      severity: 'success',
      summary: 'Saved',
      detail: 'Queue created',
      life: 0,
    });

    const toasts = toastEls();
    expect(toasts.length).toBe(1);
    expect(toasts[0].classList.contains('sbb-toast--success')).toBe(true);
    expect(toasts[0].querySelector('.sbb-toast__summary')?.textContent).toContain(
      'Saved',
    );
    expect(toasts[0].querySelector('.sbb-toast__detail')?.textContent).toContain(
      'Queue created',
    );
  });

  it('auto-dismisses after the configured life', async () => {
    service.show({ severity: 'info', summary: 'Heads up', life: 50 });
    expect(toastEls().length).toBe(1);

    await wait(100);
    expect(toastEls().length).toBe(0);
  });

  it('keeps sticky toasts (life 0) until dismissed', async () => {
    const id = service.show({ severity: 'warn', summary: 'Careful', life: 0 });
    await wait(60);
    expect(toastEls().length).toBe(1);

    service.dismiss(id);
    expect(toastEls().length).toBe(0);
  });

  it('dismisses via the close button', () => {
    service.show({ severity: 'error', summary: 'Boom', life: 0 });
    const button = toastEls()[0].querySelector<HTMLButtonElement>(
      '.sbb-toast__close',
    );
    button?.click();
    expect(toastEls().length).toBe(0);
  });

  it('stacks multiple toasts newest last', () => {
    service.show({ severity: 'info', summary: 'First', life: 0 });
    service.show({ severity: 'info', summary: 'Second', life: 0 });

    const summaries = Array.from(toastEls()).map((el) =>
      el.querySelector('.sbb-toast__summary')?.textContent?.trim(),
    );
    expect(summaries).toEqual(['First', 'Second']);
  });

  it('convenience methods set the matching severity', () => {
    service.success('ok');
    service.error('nope');
    service.info('fyi');
    service.warn('hmm');

    const classes = Array.from(toastEls()).map((el) => el.className);
    expect(classes[0]).toContain('sbb-toast--success');
    expect(classes[1]).toContain('sbb-toast--error');
    expect(classes[2]).toContain('sbb-toast--info');
    expect(classes[3]).toContain('sbb-toast--warn');
  });

  it('clear() removes every toast', () => {
    service.show({ severity: 'info', summary: 'a', life: 0 });
    service.show({ severity: 'info', summary: 'b', life: 0 });
    expect(toastEls().length).toBe(2);

    service.clear();
    expect(toastEls().length).toBe(0);
  });
});
