import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SbbTag } from './tag';
import { SbbTagSeverity } from './tag.models';

@Component({
  imports: [SbbTag],
  template: `<sbb-tag [severity]="severity()">{{ label() }}</sbb-tag>`,
})
class HostComponent {
  readonly severity = signal<SbbTagSeverity>('secondary');
  readonly label = signal('draft');
}

describe('SbbTag', () => {
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

  function tagEl(): HTMLElement {
    return fixture.debugElement.query(By.css('.sbb-tag')).nativeElement;
  }

  it('renders a span with projected label content', () => {
    const el = tagEl();
    expect(el.tagName).toBe('SPAN');
    expect(el.textContent).toContain('draft');
  });

  it('defaults to the secondary severity class', () => {
    expect(tagEl().classList).toContain('sbb-tag--secondary');
  });

  it('reflects the severity input onto the tag class and updates reactively', () => {
    host.severity.set('danger');
    fixture.detectChanges();

    const el = tagEl();
    expect(el.classList).toContain('sbb-tag--danger');
    expect(el.classList).not.toContain('sbb-tag--secondary');
  });

  it('updates projected content when the label changes', () => {
    host.label.set('sent');
    fixture.detectChanges();
    expect(tagEl().textContent).toContain('sent');
  });
});
