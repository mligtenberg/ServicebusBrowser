import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SbbAccordion } from './accordion.component';
import { SbbAccordionPanel } from './accordion-panel.component';

/** Host exercises the PUBLIC API only: [multiple] on the container, [open]/(openChange) per panel. */
@Component({
  imports: [SbbAccordion, SbbAccordionPanel],
  template: `
    <sbb-accordion [multiple]="multiple()">
      <sbb-accordion-panel [(open)]="firstOpen">
        <div sbbAccordionPanelHeader>Headers</div>
        <div class="panel-body">Header filters go here</div>
      </sbb-accordion-panel>
      <sbb-accordion-panel [(open)]="secondOpen" [disabled]="secondDisabled()">
        <div sbbAccordionPanelHeader>Properties</div>
        <div class="panel-body">Property filters go here</div>
      </sbb-accordion-panel>
    </sbb-accordion>
  `,
})
class HostComponent {
  multiple = signal(false);
  firstOpen = signal(false);
  secondOpen = signal(false);
  secondDisabled = signal(false);
}

describe('SbbAccordion + SbbAccordionPanel', () => {
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

  function getPanels(): SbbAccordionPanel[] {
    return fixture.debugElement
      .queryAll(By.directive(SbbAccordionPanel))
      .map((debugEl) => debugEl.componentInstance as SbbAccordionPanel);
  }

  function getTriggers(): HTMLButtonElement[] {
    return fixture.debugElement.queryAll(By.css('.sbb-accordion-panel__trigger')).map((el) => el.nativeElement);
  }

  it('should create', () => {
    expect(getPanels().length).toBe(2);
  });

  it('should project the header content into the trigger', () => {
    const titles = fixture.debugElement.queryAll(By.css('.sbb-accordion-panel__title'));
    expect(titles[0].nativeElement.textContent.trim()).toBe('Headers');
    expect(titles[1].nativeElement.textContent.trim()).toBe('Properties');
  });

  it('should project body content', () => {
    const bodies = fixture.debugElement.queryAll(By.css('.panel-body'));
    expect(bodies[0].nativeElement.textContent.trim()).toBe('Header filters go here');
    expect(bodies[1].nativeElement.textContent.trim()).toBe('Property filters go here');
  });

  it('should start closed by default', () => {
    const panels = getPanels();
    expect(panels[0].open()).toBe(false);
    expect(panels[1].open()).toBe(false);
  });

  it('should open a panel when its trigger is clicked, updating the `open` signal', () => {
    getTriggers()[0].click();
    fixture.detectChanges();

    expect(getPanels()[0].open()).toBe(true);
    expect(host.firstOpen()).toBe(true);
  });

  it('should close an open panel when its trigger is clicked again', () => {
    getTriggers()[0].click();
    fixture.detectChanges();
    getTriggers()[0].click();
    fixture.detectChanges();

    expect(getPanels()[0].open()).toBe(false);
    expect(host.firstOpen()).toBe(false);
  });

  it('should reflect [open] set programmatically onto the rendered trigger state', () => {
    host.firstOpen.set(true);
    fixture.detectChanges();

    expect(getTriggers()[0].getAttribute('aria-expanded')).toBe('true');
  });

  it('should close the other open panel when a new one is opened in single mode', () => {
    getTriggers()[0].click();
    fixture.detectChanges();
    expect(getPanels()[0].open()).toBe(true);

    getTriggers()[1].click();
    fixture.detectChanges();

    expect(getPanels()[0].open()).toBe(false);
    expect(getPanels()[1].open()).toBe(true);
    expect(host.firstOpen()).toBe(false);
    expect(host.secondOpen()).toBe(true);
  });

  it('should allow multiple panels open at once when [multiple]="true"', () => {
    host.multiple.set(true);
    fixture.detectChanges();

    getTriggers()[0].click();
    fixture.detectChanges();
    getTriggers()[1].click();
    fixture.detectChanges();

    expect(getPanels()[0].open()).toBe(true);
    expect(getPanels()[1].open()).toBe(true);
  });

  it('should not open a disabled panel when its trigger is clicked', () => {
    host.secondDisabled.set(true);
    fixture.detectChanges();

    getTriggers()[1].click();
    fixture.detectChanges();

    expect(getPanels()[1].open()).toBe(false);
    expect(host.secondOpen()).toBe(false);
  });
});
