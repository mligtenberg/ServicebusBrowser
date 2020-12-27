import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopicPlaneSubscriptionComponent } from './topic-plane-subscription.component';

describe('TopicPlaneSubscriptionComponent', () => {
  let component: TopicPlaneSubscriptionComponent;
  let fixture: ComponentFixture<TopicPlaneSubscriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TopicPlaneSubscriptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TopicPlaneSubscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
