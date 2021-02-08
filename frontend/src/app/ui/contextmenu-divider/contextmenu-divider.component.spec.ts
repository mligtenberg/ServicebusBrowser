import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContextmenuDividerComponent } from './contextmenu-divider.component';

describe('ContextmenuDividerComponent', () => {
  let component: ContextmenuDividerComponent;
  let fixture: ComponentFixture<ContextmenuDividerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContextmenuDividerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContextmenuDividerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
