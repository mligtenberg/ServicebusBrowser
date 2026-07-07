import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SbbSplitter } from './splitter.component';
import { SbbSplitterPanel } from './splitter-panel.component';
import { SbbSplitterLayout } from './splitter.models';

@Component({
  imports: [SbbSplitter, SbbSplitterPanel],
  template: `
    <sbb-splitter [orientation]="orientation()">
      <sbb-splitter-panel [size]="60">A</sbb-splitter-panel>
      <sbb-splitter-panel [size]="40">B</sbb-splitter-panel>
      <sbb-splitter-panel [size]="0">C</sbb-splitter-panel>
    </sbb-splitter>
  `,
})
class HostComponent {
  readonly orientation = signal<SbbSplitterLayout>('horizontal');
}

describe('SbbSplitter', () => {
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

  function query(selector: string): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll(selector));
  }

  it('renders one panel per projected sbb-splitter-panel', () => {
    expect(query('sbb-splitter-panel').length).toBe(3);
  });

  it('reflects the orientation input onto the splitter host data-layout attribute', () => {
    const splitter = fixture.nativeElement.querySelector('sbb-splitter');
    expect(splitter.getAttribute('data-layout')).toBe('horizontal');

    host.orientation.set('vertical');
    fixture.detectChanges();
    expect(splitter.getAttribute('data-layout')).toBe('vertical');
  });

  it('renders a drag handle after every panel except the last', () => {
    // 3 panels -> 2 gutters (after A and after B, none after C).
    expect(query('.sbb-splitter-panel__handle').length).toBe(2);
  });

  it('projects panel content', () => {
    const text = fixture.nativeElement.textContent.replace(/\s+/g, '');
    expect(text).toContain('A');
    expect(text).toContain('B');
    expect(text).toContain('C');
  });
});
