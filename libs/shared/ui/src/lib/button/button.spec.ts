import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { SbbButton } from './button';

@Component({
  imports: [SbbButton],
  template: `
    <sbb-button
      [severity]="severity()"
      [variant]="variant()"
      [size]="size()"
      [icon]="icon()"
      [iconOnly]="iconOnly()"
      [rounded]="rounded()"
      [loading]="loading()"
      [disabled]="disabled()"
      [aria-label]="ariaLabel()"
      (click)="onClick()"
    >
      {{ label() }}
    </sbb-button>
  `,
})
class HostComponent {
  readonly severity = signal<'primary' | 'secondary' | 'danger'>('primary');
  readonly variant = signal<'filled' | 'outlined' | 'text'>('filled');
  readonly size = signal<'small' | 'medium' | 'large'>('medium');
  readonly icon = signal<typeof faTrash | undefined>(undefined);
  readonly iconOnly = signal(false);
  readonly rounded = signal(false);
  readonly loading = signal(false);
  readonly disabled = signal(false);
  readonly ariaLabel = signal<string | undefined>(undefined);
  readonly label = signal('Save');
  clicked = 0;
  onClick(): void {
    this.clicked++;
  }
}

@Component({
  imports: [SbbButton],
  template: `<sbb-button [iconOnly]="true" aria-label="More actions"></sbb-button>`,
})
class StaticAriaLabelHostComponent {}

describe('SbbButton', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function buttonEl(): HTMLButtonElement {
    return fixture.debugElement.query(By.css('button')).nativeElement;
  }

  it('renders a native <button> with projected label content', () => {
    const el = buttonEl();
    expect(el.tagName).toBe('BUTTON');
    expect(el.textContent).toContain('Save');
  });

  it('defaults to primary/filled/medium classes and type="button"', () => {
    const el = buttonEl();
    expect(el.classList).toContain('sbb-button--primary');
    expect(el.classList).toContain('sbb-button--filled');
    expect(el.classList).toContain('sbb-button--medium');
    expect(el.type).toBe('button');
  });

  it('reflects severity, variant and size onto the native button classes', () => {
    host.severity.set('danger');
    host.variant.set('outlined');
    host.size.set('large');
    fixture.detectChanges();

    const el = buttonEl();
    expect(el.classList).toContain('sbb-button--danger');
    expect(el.classList).toContain('sbb-button--outlined');
    expect(el.classList).toContain('sbb-button--large');
    expect(el.classList).not.toContain('sbb-button--primary');
  });

  it('emits (click) when enabled and clicked', () => {
    buttonEl().click();
    expect(host.clicked).toBe(1);
  });

  it('sets the native disabled attribute and blocks clicks when disabled', () => {
    host.disabled.set(true);
    fixture.detectChanges();

    const el = buttonEl();
    expect(el.disabled).toBe(true);
    el.click();
    expect(host.clicked).toBe(0);
  });

  it('is implicitly disabled while loading, even if disabled=false', () => {
    host.loading.set(true);
    fixture.detectChanges();

    const el = buttonEl();
    expect(el.disabled).toBe(true);
    expect(el.classList).toContain('sbb-button--loading');
    expect(el.getAttribute('aria-busy')).toBe('true');
    el.click();
    expect(host.clicked).toBe(0);
  });

  it('renders a spinner icon instead of the configured icon while loading', () => {
    host.icon.set(faTrash);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.sbb-button__icon'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('.sbb-button__spinner'))).toBeFalsy();

    host.loading.set(true);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.sbb-button__spinner'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('.sbb-button__icon'))).toBeFalsy();
  });

  it('applies rounded and icon-only classes and visually hides the label', () => {
    host.iconOnly.set(true);
    host.rounded.set(true);
    fixture.detectChanges();

    const el = buttonEl();
    expect(el.classList).toContain('sbb-button--icon-only');
    expect(el.classList).toContain('sbb-button--rounded');
    const labelSpan = fixture.debugElement.query(By.css('.sbb-button__label'));
    expect(labelSpan.nativeElement.classList).toContain('sbb-button__label--hidden');
  });

  it('forwards aria-label onto the native button, not the host element', () => {
    host.ariaLabel.set('More actions');
    fixture.detectChanges();

    const el = buttonEl();
    expect(el.getAttribute('aria-label')).toBe('More actions');
    expect(fixture.debugElement.nativeElement.getAttribute('aria-label')).toBeNull();
  });

  it('accepts a static aria-label attribute, matching existing call-site syntax', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [StaticAriaLabelHostComponent],
    }).compileComponents();
    const staticFixture = TestBed.createComponent(StaticAriaLabelHostComponent);
    staticFixture.detectChanges();

    const el = staticFixture.debugElement.query(By.css('button')).nativeElement;
    expect(el.getAttribute('aria-label')).toBe('More actions');
  });
});
