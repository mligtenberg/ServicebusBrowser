import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SbbDialog } from './dialog.component';

@Component({
  standalone: true,
  imports: [SbbDialog],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <sbb-dialog [(open)]="open" [header]="header()" [closable]="closable()">
      <p class="body-content">Hello</p>
      <div sbbDialogFooter class="footer-content">
        <button type="button" class="footer-button">Confirm</button>
      </div>
    </sbb-dialog>
  `,
})
class HostComponent {
  readonly open = signal(false);
  readonly header = signal<string | undefined>(undefined);
  readonly closable = signal(true);
}

describe('SbbDialog', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    document
      .querySelectorAll('.cdk-overlay-container')
      .forEach((el) => el.remove());
  });

  function tick(): void {
    fixture.detectChanges();
  }

  it('does not render dialog content while closed', () => {
    expect(document.querySelector('.sbb-dialog')).toBeNull();
  });

  it('opens and renders projected content when open is set to true', () => {
    host.open.set(true);
    tick();

    expect(document.querySelector('.sbb-dialog')).not.toBeNull();
    expect(document.querySelector('.body-content')?.textContent).toContain(
      'Hello',
    );
  });

  it('renders the header text when provided', () => {
    host.header.set('Delete queue');
    host.open.set(true);
    tick();

    expect(document.querySelector('.sbb-dialog__title')?.textContent).toContain(
      'Delete queue',
    );
  });

  it('closes and resets open back to false when the close button is clicked', () => {
    host.open.set(true);
    tick();

    const closeButton = document.querySelector<HTMLButtonElement>(
      '.sbb-dialog__close',
    );
    expect(closeButton).not.toBeNull();
    closeButton?.click();
    tick();

    expect(document.querySelector('.sbb-dialog')).toBeNull();
    expect(host.open()).toBe(false);
  });

  it('omits the close button when closable is false', () => {
    host.closable.set(false);
    host.open.set(true);
    tick();

    expect(document.querySelector('.sbb-dialog')).not.toBeNull();
    expect(document.querySelector('.sbb-dialog__close')).toBeNull();
  });

  it('still shows the header bar when not closable but a header is set', () => {
    host.closable.set(false);
    host.header.set('Working');
    host.open.set(true);
    tick();

    expect(document.querySelector('.sbb-dialog__title')?.textContent).toContain(
      'Working',
    );
    expect(document.querySelector('.sbb-dialog__close')).toBeNull();
  });

  it('projects footer content', () => {
    host.open.set(true);
    tick();

    expect(document.querySelector('.footer-content')?.textContent).toContain(
      'Confirm',
    );
  });

  it('re-opens after being closed', () => {
    host.open.set(true);
    tick();
    expect(document.querySelector('.sbb-dialog')).not.toBeNull();

    host.open.set(false);
    tick();
    expect(document.querySelector('.sbb-dialog')).toBeNull();

    host.open.set(true);
    tick();
    expect(document.querySelector('.sbb-dialog')).not.toBeNull();
  });
});
