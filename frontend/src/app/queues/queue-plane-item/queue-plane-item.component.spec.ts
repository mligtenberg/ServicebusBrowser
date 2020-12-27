import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueuePlaneItemComponent } from './queue-plane-item.component';

describe('QueuePlaneItemComponent', () => {
  let component: QueuePlaneItemComponent;
  let fixture: ComponentFixture<QueuePlaneItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QueuePlaneItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueuePlaneItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
