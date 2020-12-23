import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopicsPlaneComponent } from './topics-plane.component';

describe('TopicsPlaneComponent', () => {
  let component: TopicsPlaneComponent;
  let fixture: ComponentFixture<TopicsPlaneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TopicsPlaneComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TopicsPlaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
