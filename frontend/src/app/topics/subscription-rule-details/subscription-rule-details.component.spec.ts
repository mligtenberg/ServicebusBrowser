import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionRuleDetailsComponent } from './subscription-rule-details.component';

describe('SubscriptionRuleDetailsComponent', () => {
  let component: SubscriptionRuleDetailsComponent;
  let fixture: ComponentFixture<SubscriptionRuleDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubscriptionRuleDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionRuleDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
