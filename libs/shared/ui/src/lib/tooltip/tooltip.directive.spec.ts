import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SbbTooltip } from './tooltip.directive';

/** Host exercises the PUBLIC API only: `[sbbTooltip]` text + `sbbTooltipPlacement`. */
@Component({
  imports: [SbbTooltip],
  template: `<button
    type="button"
    [sbbTooltip]="text()"
    [sbbTooltipPlacement]="placement()"
  >
    Delete workspace
  </button>`,
})
class HostComponent {
  readonly text = signal<string | undefined>('Delete workspace');
  readonly placement = signal<'top' | 'bottom' | 'left' | 'right'>('top');
}

/** Waits real wall-clock time — this suite runs zoneless, without zone.js/testing's fakeAsync. */
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('SbbTooltip', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let button: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    button = fixture.nativeElement.querySelector('button');
  });

  afterEach(() => {
    fixture.destroy();
  });

  function overlayPaneText(): string | null {
    const pane = document.querySelector('.sbb-tooltip-overlay-pane');
    return pane ? pane.textContent : null;
  }

  it('does not render a tooltip overlay before any interaction', () => {
    expect(overlayPaneText()).toBeNull();
  });

  it('shows the tooltip text in an overlay after hovering past the show delay', async () => {
    button.dispatchEvent(new MouseEvent('mouseenter'));
    await wait(150);
    expect(overlayPaneText()).toBeNull();

    await wait(250);
    fixture.detectChanges();
    expect(overlayPaneText()).toContain('Delete workspace');
  });

  it('hides the tooltip after mouseleave past the hide delay', async () => {
    button.dispatchEvent(new MouseEvent('mouseenter'));
    await wait(350);
    fixture.detectChanges();
    expect(overlayPaneText()).toContain('Delete workspace');

    button.dispatchEvent(new MouseEvent('mouseleave'));
    await wait(150);
    fixture.detectChanges();
    expect(overlayPaneText()).toBeNull();
  });

  it('shows the tooltip on focus and hides it on blur', async () => {
    button.dispatchEvent(new FocusEvent('focus'));
    await wait(350);
    fixture.detectChanges();
    expect(overlayPaneText()).toContain('Delete workspace');

    button.dispatchEvent(new FocusEvent('blur'));
    await wait(150);
    fixture.detectChanges();
    expect(overlayPaneText()).toBeNull();
  });

  it('does not show a tooltip when the bound text is empty', async () => {
    host.text.set('');
    fixture.detectChanges();

    button.dispatchEvent(new MouseEvent('mouseenter'));
    await wait(350);
    fixture.detectChanges();
    expect(overlayPaneText()).toBeNull();
  });

  it('sets an aria-describedby pointing at a live description with the tooltip text', () => {
    const describedBy = button.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    const description = document.getElementById(describedBy as string);
    expect(description?.textContent).toBe('Delete workspace');
  });

  it('applies the requested placement without erroring and still shows the panel', async () => {
    host.placement.set('right');
    fixture.detectChanges();

    button.dispatchEvent(new MouseEvent('mouseenter'));
    await wait(350);
    fixture.detectChanges();

    const pane = document.querySelector('.sbb-tooltip-overlay-pane');
    expect(pane).toBeTruthy();
    expect(overlayPaneText()).toContain('Delete workspace');
  });

  it('removes the overlay and its accessible description on destroy', async () => {
    button.dispatchEvent(new MouseEvent('mouseenter'));
    await wait(350);
    fixture.detectChanges();
    expect(overlayPaneText()).toContain('Delete workspace');

    const describedBy = button.getAttribute('aria-describedby') as string;
    fixture.destroy();
    await wait(150);

    expect(document.querySelector('.sbb-tooltip-overlay-pane')).toBeNull();
    expect(document.getElementById(describedBy)).toBeNull();
  });
});
