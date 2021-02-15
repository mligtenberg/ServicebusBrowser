import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextboxInputDialogComponent } from './textbox-input-dialog.component';

describe('TextboxInputDialogComponent', () => {
  let component: TextboxInputDialogComponent;
  let fixture: ComponentFixture<TextboxInputDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TextboxInputDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TextboxInputDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
