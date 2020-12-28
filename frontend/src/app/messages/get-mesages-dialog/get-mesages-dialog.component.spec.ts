import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetMesagesDialogComponent } from './get-mesages-dialog.component';

describe('GetMesagesDialogComponent', () => {
  let component: GetMesagesDialogComponent;
  let fixture: ComponentFixture<GetMesagesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GetMesagesDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GetMesagesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
