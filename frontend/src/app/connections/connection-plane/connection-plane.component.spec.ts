import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectionPlaneComponent } from './connection-plane.component';

describe('ConnectionPlaneComponent', () => {
  let component: ConnectionPlaneComponent;
  let fixture: ComponentFixture<ConnectionPlaneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConnectionPlaneComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectionPlaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
