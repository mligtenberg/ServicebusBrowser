import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectionPlaneItemComponent } from './connection-plane-item.component';

describe('ConnectionPlaneItemComponent', () => {
  let component: ConnectionPlaneItemComponent;
  let fixture: ComponentFixture<ConnectionPlaneItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConnectionPlaneItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectionPlaneItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
