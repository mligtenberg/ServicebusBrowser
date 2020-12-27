import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewMessagesComponent } from './view-messages.component';

describe('ViewMessagesComponent', () => {
  let component: ViewMessagesComponent;
  let fixture: ComponentFixture<ViewMessagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewMessagesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
