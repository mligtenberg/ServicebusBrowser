import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SbbPopover } from './popover';

@Component({
  standalone: true,
  imports: [SbbPopover],
  template: `
    <button #trigger type="button" (click)="pop.toggle(trigger)">
      Open
    </button>
    <sbb-popover #pop (opened)="openCount.set(openCount() + 1)" (closed)="closeCount.set(closeCount() + 1)">
      <div class="content">Hello {{ name() }}</div>
    </sbb-popover>
  `,
})
class HostComponent {
  readonly name = signal('world');
  readonly openCount = signal(0);
  readonly closeCount = signal(0);
}

describe('SbbPopover', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let popover: SbbPopover;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    popover = fixture.debugElement.query(By.directive(SbbPopover))
      .componentInstance as SbbPopover;
  });

  afterEach(() => {
    // Overlays attach to the CDK global overlay container appended to
    // document.body — dispose explicitly so panels don't leak between specs.
    popover.close();
  });

  it('should create', () => {
    expect(popover).toBeTruthy();
  });

  it('should not render panel content until opened', () => {
    expect(document.querySelector('.content')).toBeNull();
  });

  it('should project content into the overlay panel once toggled open', () => {
    const trigger = fixture.debugElement.query(
      By.css('button'),
    ).nativeElement as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();

    expect(popover.isOpen()).toBe(true);
    const content = document.querySelector('.content');
    expect(content).not.toBeNull();
    expect(content?.textContent).toContain('Hello world');
  });

  it('should close on a second toggle from the same trigger', () => {
    const trigger = fixture.debugElement.query(
      By.css('button'),
    ).nativeElement as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();
    expect(popover.isOpen()).toBe(true);

    trigger.click();
    fixture.detectChanges();
    expect(popover.isOpen()).toBe(false);
  });

  it('should emit opened/closed as the panel state changes', () => {
    const trigger = fixture.debugElement.query(
      By.css('button'),
    ).nativeElement as HTMLButtonElement;

    trigger.click();
    fixture.detectChanges();
    expect(host.openCount()).toBe(1);
    expect(host.closeCount()).toBe(0);

    trigger.click();
    fixture.detectChanges();
    expect(host.openCount()).toBe(1);
    expect(host.closeCount()).toBe(1);
  });

  it('should open via the imperative open() method and close via close()', () => {
    const trigger = fixture.debugElement.query(
      By.css('button'),
    ).nativeElement as HTMLButtonElement;

    popover.open(trigger);
    fixture.detectChanges();
    expect(popover.isOpen()).toBe(true);

    popover.close();
    fixture.detectChanges();
    expect(popover.isOpen()).toBe(false);
  });
});
