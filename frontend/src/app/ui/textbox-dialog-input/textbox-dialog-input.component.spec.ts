import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextboxDialogInputComponent } from './textbox-dialog-input.component';

describe('TextboxDialogInputComponent', () => {
  let component: TextboxDialogInputComponent;
  let fixture: ComponentFixture<TextboxDialogInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TextboxDialogInputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TextboxDialogInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
