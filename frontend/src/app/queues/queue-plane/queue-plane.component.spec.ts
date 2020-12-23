import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueuePlaneComponent } from './queue-plane.component';

describe('QueuePlaneComponent', () => {
  let component: QueuePlaneComponent;
  let fixture: ComponentFixture<QueuePlaneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QueuePlaneComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueuePlaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
