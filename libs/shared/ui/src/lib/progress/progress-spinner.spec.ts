import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SbbProgressSpinner } from './progress-spinner';

@Component({
  imports: [SbbProgressSpinner],
  template: `<sbb-progress-spinner [size]="size()" />`,
})
class HostComponent {
  readonly size = signal<number>(1.3);
}

describe('SbbProgressSpinner', () => {
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

  function spinnerEl(): HTMLElement {
    return fixture.debugElement.query(By.css('sbb-progress-spinner')).nativeElement;
  }

  it('exposes a progressbar role for accessibility', () => {
    expect(spinnerEl().getAttribute('role')).toBe('progressbar');
  });

  it('renders an animated svg indicator', () => {
    const svg = fixture.debugElement.query(By.css('svg'));
    expect(svg).toBeTruthy();
  });

  it('defaults to a 1.3rem size', () => {
    expect(spinnerEl().style.getPropertyValue('--sbb-progress-spinner-size')).toBe('1.3rem');
  });

  it('reflects the size input onto the host as a CSS custom property', () => {
    host.size.set(2.5);
    fixture.detectChanges();
    expect(spinnerEl().style.getPropertyValue('--sbb-progress-spinner-size')).toBe('2.5rem');
  });
});
