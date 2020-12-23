import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContextmenuItemComponent } from './contextmenu-item.component';

describe('ContextmenuItemComponent', () => {
  let component: ContextmenuItemComponent;
  let fixture: ComponentFixture<ContextmenuItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContextmenuItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContextmenuItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
