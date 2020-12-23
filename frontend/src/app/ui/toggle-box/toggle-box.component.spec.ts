import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToggleBoxComponent } from './toggle-box.component';

describe('ToggleBoxComponent', () => {
  let component: ToggleBoxComponent;
  let fixture: ComponentFixture<ToggleBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ToggleBoxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ToggleBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
