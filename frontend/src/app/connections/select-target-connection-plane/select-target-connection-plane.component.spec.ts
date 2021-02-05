import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectTargetConnectionPlaneComponent } from './select-target-connection-plane.component';

describe('SelectTargetConnectionPlaneComponent', () => {
  let component: SelectTargetConnectionPlaneComponent;
  let fixture: ComponentFixture<SelectTargetConnectionPlaneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectTargetConnectionPlaneComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectTargetConnectionPlaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
