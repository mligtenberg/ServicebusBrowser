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

  it('keyboard-resizes the gutter, moving size from one panel to its neighbour', () => {
    const panels = query('sbb-splitter-panel');
    expect(panels[0].getAttribute('data-panel-size')).toBe('60');
    expect(panels[1].getAttribute('data-panel-size')).toBe('40');

    const firstHandle = query('.sbb-splitter-panel__handle')[0];
    firstHandle.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
    );
    fixture.detectChanges();

    // ArrowRight grows the left panel by 1% and shrinks its right neighbour by 1%.
    expect(panels[0].getAttribute('data-panel-size')).toBe('61');
    expect(panels[1].getAttribute('data-panel-size')).toBe('39');
    // Untouched panel is unaffected.
    expect(panels[2].getAttribute('data-panel-size')).toBe('0');
  });

  it('starts a pointer drag from the gutter (delegates to the group startResize)', () => {
    const firstHandle = query('.sbb-splitter-panel__handle')[0];
    expect(document.body.style.cursor).not.toBe('ew-resize');

    firstHandle.dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true, clientX: 100, clientY: 0 }),
    );
    // startResize sets the resize cursor synchronously; only reached with a valid index.
    expect(document.body.style.cursor).toBe('ew-resize');

    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    expect(document.body.style.cursor).toBe('default');
  });
});
