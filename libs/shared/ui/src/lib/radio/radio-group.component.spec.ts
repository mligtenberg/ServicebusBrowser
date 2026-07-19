import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { SbbRadioGroup } from './radio-group.component';
import { SbbRadio } from './radio.component';

@Component({
  imports: [SbbRadioGroup, SbbRadio, FormsModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <sbb-radio-group [orientation]="orientation" [(ngModel)]="value">
      <sbb-radio value="connectionString">Connection String</sbb-radio>
      <sbb-radio value="azureAD">Azure AD</sbb-radio>
      <sbb-radio value="disabledOption" [disabled]="true">Disabled</sbb-radio>
    </sbb-radio-group>
  `,
})
class HostComponent {
  value: string | undefined;
  orientation: 'vertical' | 'horizontal' = 'vertical';
}

describe('SbbRadioGroup', () => {
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

  function radioInputs(): HTMLInputElement[] {
    return fixture.debugElement
      .queryAll(By.css('input[type="radio"]'))
      .map((de) => de.nativeElement as HTMLInputElement);
  }

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render one radio input per projected sbb-radio', () => {
    expect(radioInputs().length).toBe(3);
  });

  it('should share the same name across all radios in the group', () => {
    const names = new Set(radioInputs().map((input) => input.name));
    expect(names.size).toBe(1);
  });

  it('should reflect the ngModel value as the checked radio (writeValue)', async () => {
    host.value = 'azureAD';
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const inputs = radioInputs();
    expect(inputs[0].checked).toBe(false);
    expect(inputs[1].checked).toBe(true);
  });

  it('should update the bound ngModel value when a radio is selected', () => {
    const inputs = radioInputs();
    inputs[1].dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(host.value).toBe('azureAD');
  });

  it('should render the disabled option as a disabled native input', () => {
    const inputs = radioInputs();
    expect(inputs[2].disabled).toBe(true);
  });

  it('should not select a disabled option', () => {
    const groupDe = fixture.debugElement.query(By.directive(SbbRadioGroup));
    const group = groupDe.componentInstance as SbbRadioGroup;
    const selectSpy = jest.spyOn(group, 'select');

    const radios = fixture.debugElement.queryAll(By.directive(SbbRadio));
    const disabledRadio = radios[2].componentInstance as SbbRadio;
    (disabledRadio as unknown as { onSelect(): void }).onSelect();

    expect(selectSpy).not.toHaveBeenCalled();
  });

  it('should apply horizontal orientation as aria-orientation', () => {
    host.orientation = 'horizontal';
    fixture.detectChanges();

    const groupEl = fixture.debugElement.query(
      By.directive(SbbRadioGroup),
    ).nativeElement as HTMLElement;
    expect(groupEl.getAttribute('aria-orientation')).toBe('horizontal');
  });
});

describe('SbbRadioGroup (CVA contract)', () => {
  let component: SbbRadioGroup;
  let fixture: ComponentFixture<SbbRadioGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SbbRadioGroup],
    }).compileComponents();
    fixture = TestBed.createComponent(SbbRadioGroup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should reflect a written value without notifying the change callback', () => {
    const changeSpy = jest.fn();
    const touchedSpy = jest.fn();
    component.registerOnChange(changeSpy);
    component.registerOnTouched(touchedSpy);

    component.writeValue('azureAD');

    expect(changeSpy).not.toHaveBeenCalled();
    expect(touchedSpy).not.toHaveBeenCalled();
  });

  it('should call the registered change and touched functions on user selection', () => {
    const changeSpy = jest.fn();
    const touchedSpy = jest.fn();
    component.registerOnChange(changeSpy);
    component.registerOnTouched(touchedSpy);

    component.select('connectionString');

    expect(changeSpy).toHaveBeenCalledWith('connectionString');
    expect(touchedSpy).toHaveBeenCalled();
  });

  it('should not re-emit change when selecting the already-selected value', () => {
    const changeSpy = jest.fn();
    component.registerOnChange(changeSpy);
    component.writeValue('connectionString');

    component.select('connectionString');

    expect(changeSpy).not.toHaveBeenCalled();
  });

  it('should disable the group via setDisabledState', () => {
    component.setDisabledState(true);
    fixture.detectChanges();

    expect(
      (component as unknown as { disabled: () => boolean }).disabled(),
    ).toBe(true);
  });
});
