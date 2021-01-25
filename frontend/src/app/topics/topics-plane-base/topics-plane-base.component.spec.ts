import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopicsPlaneBaseComponent } from './topics-plane-base.component';

describe('TopicsPlaneBaseComponent', () => {
  let component: TopicsPlaneBaseComponent;
  let fixture: ComponentFixture<TopicsPlaneBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TopicsPlaneBaseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TopicsPlaneBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
