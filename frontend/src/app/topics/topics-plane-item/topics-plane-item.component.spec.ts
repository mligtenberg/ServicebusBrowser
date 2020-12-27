import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopicsPlaneItemComponent } from './topics-plane-item.component';

describe('TopicsPlaneItemComponent', () => {
  let component: TopicsPlaneItemComponent;
  let fixture: ComponentFixture<TopicsPlaneItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TopicsPlaneItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TopicsPlaneItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
