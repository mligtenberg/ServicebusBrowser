import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SbbScrollPanel } from './scroll-panel';

@Component({
  imports: [SbbScrollPanel],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <sbb-scroll-panel [hideScrollbar]="hideScrollbar()">
      <p class="projected-content">Hello content</p>
    </sbb-scroll-panel>
  `,
})
class HostComponent {
  hideScrollbar = signal(false);
}

describe('SbbScrollPanel', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  function scrollPanelHost(): HTMLElement {
    return fixture.nativeElement.querySelector('sbb-scroll-panel');
  }

  function viewport(): HTMLElement {
    return fixture.nativeElement.querySelector('.sbb-scroll-panel-viewport');
  }

  it('projects arbitrary content into the scrollable viewport', () => {
    const projected = viewport().querySelector('.projected-content');
    expect(projected?.textContent).toContain('Hello content');
  });

  it('renders a single scrollable viewport wrapping the projected content', () => {
    const viewports = fixture.nativeElement.querySelectorAll('.sbb-scroll-panel-viewport');
    expect(viewports.length).toBe(1);
  });

  it('does not apply the hide-scrollbar host class by default', () => {
    expect(scrollPanelHost().classList).not.toContain('sbb-scroll-panel-host--hide-scrollbar');
  });

  it('applies the hide-scrollbar host class when hideScrollbar is true', () => {
    fixture.componentInstance.hideScrollbar.set(true);
    fixture.detectChanges();

    expect(scrollPanelHost().classList).toContain('sbb-scroll-panel-host--hide-scrollbar');
  });

  it('removes the hide-scrollbar host class when hideScrollbar toggles back to false', () => {
    fixture.componentInstance.hideScrollbar.set(true);
    fixture.detectChanges();
    fixture.componentInstance.hideScrollbar.set(false);
    fixture.detectChanges();

    expect(scrollPanelHost().classList).not.toContain('sbb-scroll-panel-host--hide-scrollbar');
  });
});
