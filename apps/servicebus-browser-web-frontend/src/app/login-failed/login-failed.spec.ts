import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginFailed } from './login-failed';

describe('LoginFailed', () => {
  let component: LoginFailed;
  let fixture: ComponentFixture<LoginFailed>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginFailed],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginFailed);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
