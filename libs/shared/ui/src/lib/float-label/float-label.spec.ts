import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SbbFloatLabel } from './float-label';

describe('SbbFloatLabel', () => {
  let fixture: ComponentFixture<SbbFloatLabel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SbbFloatLabel],
    }).compileComponents();
    fixture = TestBed.createComponent(SbbFloatLabel);
    fixture.componentRef.setInput('label', 'Host');
    fixture.detectChanges();
  });

  function labelEl(): HTMLLabelElement {
    return fixture.debugElement.query(By.css('label')).nativeElement;
  }

  it('renders the label text', () => {
    expect(labelEl().textContent?.trim()).toBe('Host');
  });

  it('reflects the "label" input reactively', () => {
    fixture.componentRef.setInput('label', 'Renamed');
    fixture.detectChanges();
    expect(labelEl().textContent?.trim()).toBe('Renamed');
  });

  it('sets the "for" attribute from the "for" input', () => {
    fixture.componentRef.setInput('for', 'the-input');
    fixture.detectChanges();
    expect(labelEl().getAttribute('for')).toBe('the-input');
  });

  it('omits the "for" attribute when none is provided', () => {
    expect(labelEl().hasAttribute('for')).toBe(false);
  });
});

@Component({
  imports: [SbbFloatLabel],
  template: `
    <sbb-float-label label="Host" for="the-input">
      <input id="the-input" />
    </sbb-float-label>
  `,
})
class HostComponent {}

describe('SbbFloatLabel projection', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('projects the wrapped control alongside the generated label', () => {
    const input = fixture.debugElement.query(By.css('input#the-input'));
    const label = fixture.debugElement.query(By.css('label'));
    expect(input).toBeTruthy();
    expect(label.attributes['for']).toBe('the-input');
    expect(label.nativeElement.textContent.trim()).toBe('Host');
  });
});
