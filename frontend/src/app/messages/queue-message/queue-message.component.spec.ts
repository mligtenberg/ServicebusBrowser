import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueueMessageComponent } from './queue-message.component';

describe('QueueMessageComponent', () => {
  let component: QueueMessageComponent;
  let fixture: ComponentFixture<QueueMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QueueMessageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueueMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
