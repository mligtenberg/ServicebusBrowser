import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SbbCard } from './card';

@Component({
  imports: [SbbCard],
  template: `
    <sbb-card [header]="header()">
      <p class="projected">Body content</p>
    </sbb-card>
  `,
})
class HostComponent {
  readonly header = signal<string | undefined>('Queue Properties');
}

describe('SbbCard', () => {
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

  function titleEl(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.sbb-card__title');
  }

  function headerRegion(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.sbb-card__header');
  }

  it('renders the header text when `header` is set', () => {
    expect(titleEl()?.textContent?.trim()).toBe('Queue Properties');
  });

  it('does not render a header region when `header` is undefined', () => {
    host.header.set(undefined);
    fixture.detectChanges();
    expect(headerRegion()).toBeNull();
  });

  it('updates the rendered header text when the input signal changes', () => {
    host.header.set('Topic Properties');
    fixture.detectChanges();
    expect(titleEl()?.textContent?.trim()).toBe('Topic Properties');
  });

  it('projects arbitrary body content via default content projection', () => {
    const projected = fixture.debugElement.query(By.css('.sbb-card__content .projected'));
    expect(projected.nativeElement.textContent).toContain('Body content');
  });
});
