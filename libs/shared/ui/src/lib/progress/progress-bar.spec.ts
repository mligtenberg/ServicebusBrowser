import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SbbProgressBar } from './progress-bar';

@Component({
  imports: [SbbProgressBar],
  template: `<sbb-progress-bar [value]="value()" [indeterminate]="indeterminate()" />`,
})
class HostComponent {
  readonly value = signal<number>(0);
  readonly indeterminate = signal<boolean>(false);
}

describe('SbbProgressBar', () => {
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

  function barEl(): HTMLElement {
    return fixture.debugElement.query(By.css('sbb-progress-bar')).nativeElement;
  }

  function indicatorEl(): HTMLElement {
    return fixture.debugElement.query(By.css('.sbb-progress-bar__indicator')).nativeElement;
  }

  it('exposes determinate aria attributes reflecting the value input', () => {
    host.value.set(42);
    fixture.detectChanges();
    expect(barEl().getAttribute('role')).toBe('progressbar');
    expect(barEl().getAttribute('aria-valuenow')).toBe('42');
    expect(barEl().getAttribute('aria-valuemin')).toBe('0');
    expect(barEl().getAttribute('aria-valuemax')).toBe('100');
  });

  it('sets the indicator width from value in determinate mode', () => {
    host.value.set(30);
    fixture.detectChanges();
    expect(indicatorEl().style.width).toBe('30%');
  });

  it('clamps out-of-range values to 0-100', () => {
    host.value.set(150);
    fixture.detectChanges();
    expect(indicatorEl().style.width).toBe('100%');

    host.value.set(-10);
    fixture.detectChanges();
    expect(indicatorEl().style.width).toBe('0%');
  });

  it('omits determinate aria value attributes and applies the indeterminate class when indeterminate', () => {
    host.indeterminate.set(true);
    fixture.detectChanges();
    expect(barEl().hasAttribute('aria-valuenow')).toBe(false);
    expect(barEl().hasAttribute('aria-valuemin')).toBe(false);
    expect(barEl().hasAttribute('aria-valuemax')).toBe(false);
    expect(indicatorEl().classList).toContain('sbb-progress-bar__indicator--indeterminate');
  });
});
