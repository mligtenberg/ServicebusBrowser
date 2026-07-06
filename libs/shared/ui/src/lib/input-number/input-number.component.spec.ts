import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SbbInputNumber } from './input-number.component';

describe('SbbInputNumber', () => {
  let component: SbbInputNumber;
  let fixture: ComponentFixture<SbbInputNumber>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SbbInputNumber],
    }).compileComponents();
    fixture = TestBed.createComponent(SbbInputNumber);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function inputEl(): HTMLInputElement {
    return fixture.debugElement.query(By.css('input')).nativeElement;
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reflect min/max/step/placeholder/inputId onto the native input', () => {
    fixture.componentRef.setInput('inputId', 'maxDeliveryCount');
    fixture.componentRef.setInput('min', 1);
    fixture.componentRef.setInput('max', 100);
    fixture.componentRef.setInput('step', 5);
    fixture.componentRef.setInput('placeholder', 'Enter a number');
    fixture.detectChanges();

    const el = inputEl();
    expect(el.id).toBe('maxDeliveryCount');
    expect(el.min).toBe('1');
    expect(el.max).toBe('100');
    expect(el.step).toBe('5');
    expect(el.placeholder).toBe('Enter a number');
  });

  it('should default step to 1', () => {
    expect(inputEl().step).toBe('1');
  });

  // --- ControlValueAccessor contract -----------------------------------

  it('writeValue should reflect the value onto the native input', () => {
    component.writeValue(42);
    fixture.detectChanges();
    expect(inputEl().value).toBe('42');
  });

  it('writeValue(null) should clear the native input', () => {
    component.writeValue(42);
    fixture.detectChanges();
    component.writeValue(null);
    fixture.detectChanges();
    expect(inputEl().value).toBe('');
  });

  it('should call the registered change function with a number on input', () => {
    const spy = jest.fn();
    component.registerOnChange(spy);

    const el = inputEl();
    el.value = '10';
    el.dispatchEvent(new Event('input'));

    expect(spy).toHaveBeenCalledWith(10);
  });

  it('should call the registered change function with null when cleared', () => {
    const spy = jest.fn();
    component.registerOnChange(spy);

    const el = inputEl();
    el.value = '';
    el.dispatchEvent(new Event('input'));

    expect(spy).toHaveBeenCalledWith(null);
  });

  it('should call the registered touched function on blur', () => {
    const spy = jest.fn();
    component.registerOnTouched(spy);

    inputEl().dispatchEvent(new Event('blur'));

    expect(spy).toHaveBeenCalled();
  });

  it('should not call the change or touched function when patched via writeValue', () => {
    const changeSpy = jest.fn();
    const touchedSpy = jest.fn();
    component.registerOnChange(changeSpy);
    component.registerOnTouched(touchedSpy);

    component.writeValue(10);
    fixture.detectChanges();

    expect(changeSpy).not.toHaveBeenCalled();
    expect(touchedSpy).not.toHaveBeenCalled();
  });

  it('should disable the native input when setDisabledState(true) is called', () => {
    component.setDisabledState(true);
    fixture.detectChanges();
    expect(inputEl().disabled).toBe(true);
  });

  it('should re-enable the native input when setDisabledState(false) is called', () => {
    component.setDisabledState(true);
    fixture.detectChanges();
    component.setDisabledState(false);
    fixture.detectChanges();
    expect(inputEl().disabled).toBe(false);
  });
});
