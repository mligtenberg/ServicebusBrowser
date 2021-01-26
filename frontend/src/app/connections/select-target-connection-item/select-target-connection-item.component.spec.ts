import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectTargetConnectionItemComponent } from './select-target-connection-item.component';

describe('SelectTargetConnectionItemComponent', () => {
  let component: SelectTargetConnectionItemComponent;
  let fixture: ComponentFixture<SelectTargetConnectionItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectTargetConnectionItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectTargetConnectionItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
