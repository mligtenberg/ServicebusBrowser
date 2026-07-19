import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LogLineComponent } from './log-line.component';
import { LogLine } from '@service-bus-browser/logs-contracts';
@Component({
  template: `<sbb-logs-log-line [logLine]="log"></sbb-logs-log-line>`,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [LogLineComponent],
})
class HostComponent {
  log: LogLine = { severity: 'info', message: 'msg', loggedAt: new Date() };
}
describe('LogLineComponent', () => {
  let host: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let component: LogLineComponent;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    component = fixture.debugElement.children[0].componentInstance;
  });
  it('returns correct color for info', () => {
    host.log = { ...host.log, severity: 'info' };
    fixture.detectChanges();
    expect(component.logLineColor()).toBe('var(--sbb-info)');
  });
  it('returns correct color for warn', () => {
    host.log = { ...host.log, severity: 'warn' };
    fixture.detectChanges();
    expect(component.logLineColor()).toBe('var(--sbb-warning)');
  });
  it('returns correct color for error', () => {
    host.log = { ...host.log, severity: 'error' };
    fixture.detectChanges();
    expect(component.logLineColor()).toBe('var(--sbb-danger)');
  });
  it('returns correct color for critical', () => {
    host.log = { ...host.log, severity: 'critical' };
    fixture.detectChanges();
    expect(component.logLineColor()).toBe('var(--sbb-danger)');
  });
  it('returns default color otherwise', () => {
    host.log = { ...host.log, severity: 'verbose' };
    fixture.detectChanges();
    expect(component.logLineColor()).toBe('var(--sbb-text-muted)');
  });
});
