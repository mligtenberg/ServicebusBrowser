import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OidcCallback } from './oidc-callback';

describe('OidcCallback', () => {
  let component: OidcCallback;
  let fixture: ComponentFixture<OidcCallback>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OidcCallback],
    }).compileComponents();

    fixture = TestBed.createComponent(OidcCallback);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
