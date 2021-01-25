import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueuePlaneBaseComponent } from './queue-plane-base.component';

describe('QueuePlaneBaseComponent', () => {
  let component: QueuePlaneBaseComponent;
  let fixture: ComponentFixture<QueuePlaneBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QueuePlaneBaseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueuePlaneBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
