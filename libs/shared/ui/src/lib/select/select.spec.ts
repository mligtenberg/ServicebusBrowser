import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SbbSelect } from './select';
import { SbbSelectOption, SbbSelectOptionGroup } from './select.models';

describe('SbbSelect', () => {
  let component: SbbSelect<string>;
  let fixture: ComponentFixture<SbbSelect<string>>;

  const options: SbbSelectOption<string>[] = [
    { label: 'One', value: 'one' },
    { label: 'Two', value: 'two' },
    { label: 'Three', value: 'three', disabled: true },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SbbSelect],
    }).compileComponents();
    fixture = TestBed.createComponent(SbbSelect<string>);
    component = fixture.componentInstance;
  });

  function setOptions(value: SbbSelectOption<string>[]): void {
    fixture.componentRef.setInput('options', value);
    fixture.detectChanges();
  }

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should reflect a written value as the selected label', () => {
    setOptions(options);
    component.writeValue('two');
    fixture.detectChanges();
    expect(component['selectedLabel']()).toBe('Two');
  });

  it('should show the placeholder label when no value is selected', () => {
    setOptions(options);
    fixture.componentRef.setInput('placeholder', 'Pick one');
    component.writeValue(null);
    fixture.detectChanges();
    expect(component['selectedLabel']()).toBeNull();
  });

  it('should flatten a plain option list into a single unnamed group', () => {
    setOptions(options);
    expect(component['groups']()).toEqual([{ label: '', options }]);
  });

  it('should pass through pre-grouped options unchanged', () => {
    const grouped: SbbSelectOptionGroup<string>[] = [
      { label: 'Group A', options: [{ label: 'One', value: 'one' }] },
      { label: 'Group B', options: [{ label: 'Two', value: 'two' }] },
    ];
    fixture.componentRef.setInput('options', grouped);
    fixture.detectChanges();
    expect(component['groups']()).toEqual(grouped);
  });

  it('should filter options by label when a filter query is set', () => {
    setOptions(options);
    component['handleFilterInput']('tw');
    fixture.detectChanges();
    expect(component['filteredGroups']()).toEqual([
      { label: '', options: [{ label: 'Two', value: 'two' }] },
    ]);
  });

  it('should call the registered change function on selection', () => {
    setOptions(options);
    const spy = jest.fn();
    component.registerOnChange(spy);
    component['handleValueChange']('one');
    expect(spy).toHaveBeenCalledWith('one');
  });

  it('should call the registered touched function on blur', () => {
    setOptions(options);
    const spy = jest.fn();
    component.registerOnTouched(spy);
    component['handleTouched']();
    expect(spy).toHaveBeenCalled();
  });

  it('should not call the change or touched function when patched via writeValue', () => {
    setOptions(options);
    const changeSpy = jest.fn();
    const touchedSpy = jest.fn();
    component.registerOnChange(changeSpy);
    component.registerOnTouched(touchedSpy);
    component.writeValue('one');
    expect(changeSpy).not.toHaveBeenCalled();
    expect(touchedSpy).not.toHaveBeenCalled();
  });

  it('should reflect the disabled state set via CVA', () => {
    setOptions(options);
    component.setDisabledState(true);
    fixture.detectChanges();
    expect(component['disabled']()).toBe(true);
  });

  function triggerButton(): HTMLButtonElement {
    return fixture.debugElement.query(By.css('.sbb-select-trigger'))
      .nativeElement;
  }

  it('should forward inputId as the trigger button id when set', () => {
    setOptions(options);
    fixture.componentRef.setInput('inputId', 'connectionTarget');
    fixture.detectChanges();
    expect(triggerButton().getAttribute('id')).toBe('connectionTarget');
  });

  it('should fall back to a generated id on the trigger button when inputId is unset', () => {
    setOptions(options);
    fixture.detectChanges();
    expect(triggerButton().getAttribute('id')).toBe(
      component['generatedTriggerId'],
    );
  });
});
