import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SbbDrawer } from './drawer.component';

@Component({
  standalone: true,
  imports: [SbbDrawer],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <sbb-drawer [(open)]="open" [header]="header()" [closable]="closable()">
      <p class="body-content">Hello</p>
    </sbb-drawer>
  `,
})
class HostComponent {
  readonly open = signal(false);
  readonly header = signal<string | undefined>(undefined);
  readonly closable = signal(true);
}

describe('SbbDrawer', () => {
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

  function detectChanges(): void {
    fixture.detectChanges();
  }

  it('does not render drawer content while closed', () => {
    expect(document.querySelector('.sbb-drawer')).toBeNull();
  });

  it('opens and renders projected content when open is set to true', () => {
    host.open.set(true);
    detectChanges();

    expect(document.querySelector('.sbb-drawer')).not.toBeNull();
    expect(document.querySelector('.body-content')?.textContent).toContain(
      'Hello',
    );
  });

  it('closes and resets open back to false when the close button is clicked', async () => {
    host.open.set(true);
    detectChanges();

    const closeButton = document.querySelector<HTMLButtonElement>(
      '.sbb-drawer__close',
    );
    expect(closeButton).not.toBeNull();
    closeButton?.click();
    detectChanges();

    // The drawer is in closing state but not yet closed/disposed
    expect(document.querySelector('.sbb-drawer')).not.toBeNull();

    // Wait 250ms for the close animation timeout (200ms) to fire
    await new Promise((resolve) => setTimeout(resolve, 250));
    detectChanges();

    expect(document.querySelector('.sbb-drawer')).toBeNull();
    expect(host.open()).toBe(false);
  });
});
