import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueueContextMenuComponent } from './queue-context-menu.component';

describe('QueueContextMenuComponent', () => {
  let component: QueueContextMenuComponent;
  let fixture: ComponentFixture<QueueContextMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QueueContextMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueueContextMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
