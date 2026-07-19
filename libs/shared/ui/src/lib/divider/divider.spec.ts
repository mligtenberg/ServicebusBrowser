import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SbbDivider } from './divider';
import {
  SbbDividerAlign,
  SbbDividerOrientation,
  SbbDividerType,
} from './divider.models';

@Component({
  imports: [SbbDivider],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <sbb-divider [layout]="layout()" [type]="type()" [align]="align()">
      {{ label() }}
    </sbb-divider>
  `,
})
class HostComponent {
  readonly layout = signal<SbbDividerOrientation>('horizontal');
  readonly type = signal<SbbDividerType>('solid');
  readonly align = signal<SbbDividerAlign>('center');
  readonly label = signal('');
}

describe('SbbDivider', () => {
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

  function dividerEl(): HTMLElement {
    return fixture.debugElement.query(By.css('sbb-divider')).nativeElement;
  }

  it('renders with role="separator" and defaults to horizontal/solid/center', () => {
    const el = dividerEl();
    expect(el.getAttribute('role')).toBe('separator');
    expect(el.getAttribute('aria-orientation')).toBe('horizontal');
    expect(el.classList).toContain('sbb-divider--horizontal');
    expect(el.classList).toContain('sbb-divider--solid');
    expect(el.classList).toContain('sbb-divider--align-center');
  });

  it('reflects layout onto the host class and aria-orientation', () => {
    host.layout.set('vertical');
    fixture.detectChanges();

    const el = dividerEl();
    expect(el.classList).toContain('sbb-divider--vertical');
    expect(el.classList).not.toContain('sbb-divider--horizontal');
    expect(el.getAttribute('aria-orientation')).toBe('vertical');
  });

  it('reflects the type input onto the host class', () => {
    host.type.set('dashed');
    fixture.detectChanges();
    expect(dividerEl().classList).toContain('sbb-divider--dashed');

    host.type.set('dotted');
    fixture.detectChanges();
    expect(dividerEl().classList).toContain('sbb-divider--dotted');
  });

  it('only applies align classes when horizontal', () => {
    host.align.set('left');
    fixture.detectChanges();
    expect(dividerEl().classList).toContain('sbb-divider--align-left');

    host.layout.set('vertical');
    fixture.detectChanges();
    expect(dividerEl().classList).not.toContain('sbb-divider--align-left');
  });

  it('projects content into the content span', () => {
    host.label.set('Or');
    fixture.detectChanges();

    const content = fixture.debugElement.query(
      By.css('.sbb-divider__content'),
    ).nativeElement as HTMLElement;
    expect(content.textContent?.trim()).toBe('Or');
  });

  it('renders two rule elements flanking the content', () => {
    const rules = fixture.debugElement.queryAll(By.css('.sbb-divider__rule'));
    expect(rules.length).toBe(2);
    expect(rules[0].nativeElement.getAttribute('aria-hidden')).toBe('true');
  });
});
