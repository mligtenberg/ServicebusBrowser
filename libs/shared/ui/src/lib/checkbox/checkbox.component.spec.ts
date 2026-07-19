import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { SbbCheckbox } from './checkbox.component';

/** Host exercises the PUBLIC API only: [label]/[disabled]/[indeterminate] + CVA via formControl. */
@Component({
  imports: [SbbCheckbox, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<sbb-checkbox [formControl]="control" [label]="label" [indeterminate]="indeterminate" />`,
})
class HostComponent {
  control = new FormControl(false, { nonNullable: true });
  label = 'Enable batched operations';
  indeterminate = false;
}

/** Host for exercising the standalone `[disabled]` input without Reactive Forms involved. */
@Component({
  imports: [SbbCheckbox],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<sbb-checkbox [label]="'Express'" [disabled]="disabled" />`,
})
class StandaloneHostComponent {
  disabled = true;
}

describe('SbbCheckbox', () => {
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

  function getCheckbox(): SbbCheckbox {
    return fixture.debugElement.query(By.directive(SbbCheckbox)).componentInstance as SbbCheckbox;
  }

  function clickControl(): void {
    const button: HTMLButtonElement = fixture.debugElement.query(
      By.css('.sbb-checkbox__control'),
    ).nativeElement;
    button.click();
    fixture.detectChanges();
  }

  it('should create', () => {
    expect(getCheckbox()).toBeTruthy();
  });

  it('should render the label text', () => {
    const label: HTMLElement = fixture.debugElement.query(By.css('.sbb-checkbox__label')).nativeElement;
    expect(label.textContent?.trim()).toBe('Enable batched operations');
  });

  it('should reflect the form control value onto the checked state (writeValue)', () => {
    host.control.setValue(true);
    fixture.detectChanges();
    expect(getCheckbox().checked()).toBe(true);
  });

  it('should update the form control value when the checkbox is clicked', () => {
    expect(host.control.value).toBe(false);
    clickControl();
    expect(host.control.value).toBe(true);
  });

  it('should mark the control as touched on blur (registerOnTouched)', () => {
    expect(host.control.touched).toBe(false);
    getCheckbox()['onTouchedHandler']();
    expect(host.control.touched).toBe(true);
  });

  it('should call the registered change function when toggled', () => {
    const spy = jest.fn();
    const checkbox = getCheckbox();
    checkbox.registerOnChange(spy);
    checkbox['onCheckedChange'](true);
    expect(spy).toHaveBeenCalledWith(true);
  });

  it('should call the registered touched function when touched', () => {
    const spy = jest.fn();
    const checkbox = getCheckbox();
    checkbox.registerOnTouched(spy);
    checkbox['onTouchedHandler']();
    expect(spy).toHaveBeenCalled();
  });

  it('should not call the change or touched function when patched via writeValue', () => {
    const changeSpy = jest.fn();
    const touchedSpy = jest.fn();
    const checkbox = getCheckbox();
    checkbox.registerOnChange(changeSpy);
    checkbox.registerOnTouched(touchedSpy);
    checkbox.writeValue(true);
    expect(changeSpy).not.toHaveBeenCalled();
    expect(touchedSpy).not.toHaveBeenCalled();
  });

  it('should default to enabled', () => {
    expect(getCheckbox().isDisabled()).toBe(false);
  });

  it('should be disabled when the standalone [disabled] input is true', async () => {
    const standaloneFixture = TestBed.createComponent(StandaloneHostComponent);
    standaloneFixture.detectChanges();
    const checkbox = standaloneFixture.debugElement.query(By.directive(SbbCheckbox))
      .componentInstance as SbbCheckbox;
    expect(checkbox.isDisabled()).toBe(true);
  });

  it('should disable the control via Reactive Forms (setDisabledState)', () => {
    host.control.disable();
    fixture.detectChanges();
    expect(getCheckbox().isDisabled()).toBe(true);
  });

  it('should re-enable the control via Reactive Forms', () => {
    host.control.disable();
    fixture.detectChanges();
    host.control.enable();
    fixture.detectChanges();
    expect(getCheckbox().isDisabled()).toBe(false);
  });
});
