import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SbbTextarea } from './textarea.component';

describe('SbbTextarea', () => {
  let component: SbbTextarea;
  let fixture: ComponentFixture<SbbTextarea>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SbbTextarea],
    }).compileComponents();

    fixture = TestBed.createComponent(SbbTextarea);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function textareaEl(): HTMLTextAreaElement {
    return fixture.debugElement.query(By.css('textarea'))
      .nativeElement as HTMLTextAreaElement;
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default rows to 3', () => {
    expect(textareaEl().rows).toBe(3);
  });

  it('should reflect the rows input', () => {
    fixture.componentRef.setInput('rows', 8);
    fixture.detectChanges();
    expect(textareaEl().rows).toBe(8);
  });

  it('should reflect the placeholder input', () => {
    fixture.componentRef.setInput('placeholder', 'New value');
    fixture.detectChanges();
    expect(textareaEl().placeholder).toBe('New value');
  });

  it('should apply the auto-resize modifier class when autoResize is set', () => {
    fixture.componentRef.setInput('autoResize', true);
    fixture.detectChanges();
    expect(
      textareaEl().classList.contains('sbb-textarea--auto-resize')
    ).toBe(true);
  });

  it('should not apply the auto-resize modifier class by default', () => {
    expect(
      textareaEl().classList.contains('sbb-textarea--auto-resize')
    ).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // ControlValueAccessor contract
  // ---------------------------------------------------------------------------

  it('should reflect a written value onto the native element', () => {
    component.writeValue('hello world');
    fixture.detectChanges();
    expect(textareaEl().value).toBe('hello world');
  });

  it('should reflect null/undefined written values as an empty string', () => {
    component.writeValue(null as unknown as string);
    fixture.detectChanges();
    expect(textareaEl().value).toBe('');
  });

  it('should call the registered change function on user input', () => {
    const spy = jest.fn();
    component.registerOnChange(spy);

    const el = textareaEl();
    el.value = 'typed text';
    el.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledWith('typed text');
  });

  it('should call the registered touched function on blur', () => {
    const spy = jest.fn();
    component.registerOnTouched(spy);

    textareaEl().dispatchEvent(new Event('blur'));

    expect(spy).toHaveBeenCalled();
  });

  it('should not call the change or touched function when patched via writeValue', () => {
    const changeSpy = jest.fn();
    const touchedSpy = jest.fn();
    component.registerOnChange(changeSpy);
    component.registerOnTouched(touchedSpy);

    component.writeValue('patched value');
    fixture.detectChanges();

    expect(changeSpy).not.toHaveBeenCalled();
    expect(touchedSpy).not.toHaveBeenCalled();
  });

  it('should disable the native element when setDisabledState(true) is called', () => {
    component.setDisabledState(true);
    fixture.detectChanges();
    expect(textareaEl().disabled).toBe(true);
  });

  it('should re-enable the native element when setDisabledState(false) is called', () => {
    component.setDisabledState(true);
    fixture.detectChanges();
    component.setDisabledState(false);
    fixture.detectChanges();
    expect(textareaEl().disabled).toBe(false);
  });
});
