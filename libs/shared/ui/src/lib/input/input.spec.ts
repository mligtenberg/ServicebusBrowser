import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SbbInput } from './input';

describe('SbbInput', () => {
  let component: SbbInput;
  let fixture: ComponentFixture<SbbInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SbbInput],
    }).compileComponents();
    fixture = TestBed.createComponent(SbbInput);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function nativeInput(): HTMLInputElement {
    return fixture.debugElement.query(By.css('input')).nativeElement;
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to type text and size md', () => {
    fixture.detectChanges();
    const input = nativeInput();
    expect(input.type).toBe('text');
    expect(input.classList).not.toContain('sbb-input--sm');
    expect(input.classList).not.toContain('sbb-input--lg');
  });

  it('should reflect the type input onto the native input', () => {
    fixture.componentRef.setInput('type', 'password');
    fixture.detectChanges();
    expect(nativeInput().type).toBe('password');
  });

  it('should reflect the placeholder input', () => {
    fixture.componentRef.setInput('placeholder', 'Enter name');
    fixture.detectChanges();
    expect(nativeInput().placeholder).toBe('Enter name');
  });

  it('should reflect the size input via css classes', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    expect(nativeInput().classList.contains('sbb-input--lg')).toBe(true);
  });

  it('should reflect the invalid input via css class and aria-invalid', () => {
    fixture.componentRef.setInput('invalid', true);
    fixture.detectChanges();
    const input = nativeInput();
    expect(input.classList.contains('sbb-input--invalid')).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('should not set aria-invalid when valid', () => {
    fixture.componentRef.setInput('invalid', false);
    fixture.detectChanges();
    expect(nativeInput().getAttribute('aria-invalid')).toBeNull();
  });

  it('writeValue should reflect the value onto the native input', () => {
    component.writeValue('hello');
    fixture.detectChanges();
    expect(nativeInput().value).toBe('hello');
  });

  it('writeValue should coerce null/undefined to an empty string', () => {
    component.writeValue(null);
    fixture.detectChanges();
    expect(nativeInput().value).toBe('');
  });

  it('should call the registered change function on user input', () => {
    const spy = jest.fn();
    component.registerOnChange(spy);
    const input = nativeInput();
    input.value = 'typed value';
    input.dispatchEvent(new Event('input'));
    expect(spy).toHaveBeenCalledWith('typed value');
  });

  it('should call the registered touched function on blur', () => {
    const spy = jest.fn();
    component.registerOnTouched(spy);
    nativeInput().dispatchEvent(new Event('blur'));
    expect(spy).toHaveBeenCalled();
  });

  it('should not call the change or touched function when patched via writeValue', () => {
    const changeSpy = jest.fn();
    const touchedSpy = jest.fn();
    component.registerOnChange(changeSpy);
    component.registerOnTouched(touchedSpy);
    component.writeValue('patched');
    expect(changeSpy).not.toHaveBeenCalled();
    expect(touchedSpy).not.toHaveBeenCalled();
  });

  it('should disable the native input via setDisabledState', () => {
    component.setDisabledState(true);
    fixture.detectChanges();
    expect(nativeInput().disabled).toBe(true);
  });

  it('should re-enable the native input via setDisabledState', () => {
    component.setDisabledState(true);
    fixture.detectChanges();
    component.setDisabledState(false);
    fixture.detectChanges();
    expect(nativeInput().disabled).toBe(false);
  });
});
