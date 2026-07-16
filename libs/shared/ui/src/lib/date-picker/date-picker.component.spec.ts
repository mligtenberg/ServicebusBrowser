import { ApplicationRef, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { SbbDatePicker } from './date-picker.component';

@Component({
  standalone: true,
  imports: [SbbDatePicker, FormsModule],
  template: `
    <sbb-date-picker
      [(ngModel)]="value"
      [showTime]="showTime()"
      [disabled]="disabled()"
    />
  `,
})
class HostComponent {
  readonly showTime = signal(false);
  readonly disabled = signal(false);
  value: Date | undefined = undefined;
}

describe('SbbDatePicker', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let appRef: ApplicationRef;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    appRef = TestBed.inject(ApplicationRef);
  });

  function input(): HTMLInputElement {
    return fixture.nativeElement.querySelector('.sbb-date-picker__input');
  }

  async function flush(): Promise<void> {
    fixture.detectChanges();
    await Promise.resolve();
    appRef.tick();
  }

  it('uses a date input by default and datetime-local when showTime is set', async () => {
    await flush();
    expect(input().type).toBe('date');

    host.showTime.set(true);
    await flush();
    expect(input().type).toBe('datetime-local');
  });

  it('formats the ngModel value into the native input (date only)', async () => {
    host.value = new Date(2024, 2, 15, 13, 45);
    await flush();

    expect(input().value).toBe('2024-03-15');
  });

  it('formats the ngModel value with time when showTime is set', async () => {
    host.showTime.set(true);
    host.value = new Date(2024, 2, 15, 13, 45);
    await flush();

    expect(input().value).toBe('2024-03-15T13:45');
  });

  it('writes a Date back through ngModel when the user picks a value', async () => {
    host.showTime.set(true);
    await flush();

    const el = input();
    el.value = '2024-03-15T13:45';
    el.dispatchEvent(new Event('input'));
    await flush();

    expect(host.value).toBeInstanceOf(Date);
    expect(host.value?.getFullYear()).toBe(2024);
    expect(host.value?.getMonth()).toBe(2);
    expect(host.value?.getDate()).toBe(15);
    expect(host.value?.getHours()).toBe(13);
    expect(host.value?.getMinutes()).toBe(45);
  });

  it('clears the value to undefined when the input is emptied', async () => {
    host.value = new Date(2024, 2, 15);
    await flush();

    const el = input();
    el.value = '';
    el.dispatchEvent(new Event('input'));
    await flush();

    expect(host.value).toBeUndefined();
  });

  it('disables the native input when disabled', async () => {
    host.disabled.set(true);
    await flush();

    expect(input().disabled).toBe(true);
  });
});
