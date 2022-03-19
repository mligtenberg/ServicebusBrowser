import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionRuleComponent } from './subscription-rule.component';

describe('SubscriptionRuleComponent', () => {
  let component: SubscriptionRuleComponent;
  let fixture: ComponentFixture<SubscriptionRuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubscriptionRuleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
