import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionContextMenuComponent } from './subscription-context-menu.component';

describe('SubscriptionContextMenuComponent', () => {
  let component: SubscriptionContextMenuComponent;
  let fixture: ComponentFixture<SubscriptionContextMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubscriptionContextMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionContextMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
