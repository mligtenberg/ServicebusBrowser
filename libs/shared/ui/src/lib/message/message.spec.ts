import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { SbbMessage } from './message';
import { SbbMessageSeverity } from './message.models';

@Component({
  imports: [SbbMessage],
  template: `
    <sbb-message [severity]="severity()">{{ text() }}</sbb-message>
  `,
})
class HostComponent {
  readonly severity = signal<SbbMessageSeverity>('info');
  readonly text = signal('Something happened');
}

describe('SbbMessage', () => {
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

  function messageEl(): HTMLElement {
    return fixture.debugElement.query(By.css('.sbb-message')).nativeElement;
  }

  function hostEl(): HTMLElement {
    return fixture.debugElement.query(By.css('sbb-message')).nativeElement;
  }

  it('renders projected text content', () => {
    expect(messageEl().textContent).toContain('Something happened');
  });

  it('exposes role="alert" on the host for accessibility', () => {
    expect(hostEl().getAttribute('role')).toBe('alert');
  });

  it('defaults to info severity class and icon', () => {
    const el = messageEl();
    expect(el.classList).toContain('sbb-message--info');
    expect(el.classList).not.toContain('sbb-message--error');
    const icon = fixture.debugElement.query(By.css('.sbb-message__icon'));
    expect(icon).toBeTruthy();
  });

  it.each<SbbMessageSeverity>(['info', 'success', 'warn', 'error'])(
    'reflects severity "%s" onto the message classes',
    (severity) => {
      host.severity.set(severity);
      fixture.detectChanges();

      const el = messageEl();
      expect(el.classList).toContain(`sbb-message--${severity}`);
      (['info', 'success', 'warn', 'error'] as const)
        .filter((s) => s !== severity)
        .forEach((other) => {
          expect(el.classList).not.toContain(`sbb-message--${other}`);
        });
    },
  );

  it('renders a distinct FontAwesome icon per severity', () => {
    const renderedIcons = new Set<string>();
    (['info', 'success', 'warn', 'error'] as const).forEach((severity) => {
      host.severity.set(severity);
      fixture.detectChanges();
      const icon = fixture.debugElement.query(By.directive(FaIconComponent))
        .nativeElement as HTMLElement;
      renderedIcons.add(icon.innerHTML);
    });
    expect(renderedIcons.size).toBe(4);
  });
});
