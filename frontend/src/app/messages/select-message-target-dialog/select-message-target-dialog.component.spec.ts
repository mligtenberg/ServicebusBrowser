import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectMessageTargetDialogComponent } from './select-message-target-dialog.component';

describe('SelectMessageTargetDialogComponent', () => {
  let component: SelectMessageTargetDialogComponent;
  let fixture: ComponentFixture<SelectMessageTargetDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectMessageTargetDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectMessageTargetDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
