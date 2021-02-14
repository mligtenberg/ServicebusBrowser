import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessagebarComponent } from './messagebar.component';

describe('MessagebarComponent', () => {
  let component: MessagebarComponent;
  let fixture: ComponentFixture<MessagebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MessagebarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MessagebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
