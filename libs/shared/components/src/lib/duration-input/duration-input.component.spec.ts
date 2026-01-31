import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DurationInputComponent } from './duration-input.component';
describe('DurationInputComponent', () => {
  let component: DurationInputComponent;
  let fixture: ComponentFixture<DurationInputComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DurationInputComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(DurationInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should parse seconds correctly', () => {
    component.writeValue('PT10S');
    expect(component.form.value).toEqual({
      seconds: 10,
      minutes: 0,
      hours: 0,
      days: 0,
      weeks: 0,
      months: 0,
      years: 0,
    });
  });
  it('should parse minutes correctly', () => {
    component.writeValue('PT10M');
    expect(component.form.value).toEqual({
      seconds: 0,
      minutes: 10,
      hours: 0,
      days: 0,
      weeks: 0,
      months: 0,
      years: 0,
    });
  });
  it('should parse hours correctly', () => {
    component.writeValue('PT10H');
    expect(component.form.value).toEqual({
      seconds: 0,
      minutes: 0,
      hours: 10,
      days: 0,
      weeks: 0,
      months: 0,
      years: 0,
    });
  });
  it('should parse days correctly', () => {
    component.writeValue('P10D');
    expect(component.form.value).toEqual({
      seconds: 0,
      minutes: 0,
      hours: 0,
      days: 10,
      weeks: 0,
      months: 0,
      years: 0,
    });
  });
  it('should parse weeks correctly', () => {
    component.writeValue('P10W');
    expect(component.form.value).toEqual({
      seconds: 0,
      minutes: 0,
      hours: 0,
      days: 0,
      weeks: 10,
      months: 0,
      years: 0,
    });
  });
  it('should parse months correctly', () => {
    component.writeValue('P10M');
    expect(component.form.value).toEqual({
      seconds: 0,
      minutes: 0,
      hours: 0,
      days: 0,
      weeks: 0,
      months: 10,
      years: 0,
    });
  });
  it('should parse years correctly', () => {
    component.writeValue('P10Y');
    expect(component.form.value).toEqual({
      seconds: 0,
      minutes: 0,
      hours: 0,
      days: 0,
      weeks: 0,
      months: 0,
      years: 10,
    });
  });
  it('should call the registered change function', () => {
    const spy = jest.fn();
    component.registerOnChange(spy);
    component.form.controls.seconds.setValue(10);
    expect(spy).toHaveBeenCalledWith('PT10S');
  });
  it('should call the registered touched function', () => {
    const spy = jest.fn();
    component.registerOnTouched(spy);
    component.form.controls.seconds.setValue(10);
    expect(spy).toHaveBeenCalled();
  });
  it('should not call the changes or touched function if the value is patched', () => {
    const changeSpy = jest.fn();
    const touchedSpy = jest.fn();
    component.registerOnChange(changeSpy);
    component.registerOnTouched(touchedSpy);
    component.writeValue('PT10S');
    expect(changeSpy).not.toHaveBeenCalled();
    expect(touchedSpy).not.toHaveBeenCalled();
  });
});
