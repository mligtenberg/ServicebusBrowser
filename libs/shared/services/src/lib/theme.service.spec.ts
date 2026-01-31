import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ColorThemeService } from './theme.service';
function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(() => ({
      matches,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })),
  });
}
describe('ColorThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });
  it('initializes preference from localStorage', () => {
    localStorage.setItem('color-theme-preference', 'dark');
    mockMatchMedia(false);
    const service = TestBed.runInInjectionContext(
      () => new ColorThemeService()
    );
    expect(service.preference()).toBe('dark');
  });
  it('stores preference changes to localStorage', fakeAsync(() => {
    mockMatchMedia(false);
    const service = TestBed.runInInjectionContext(
      () => new ColorThemeService()
    );
    service.setPreference('light');
    tick();
    expect(localStorage.getItem('color-theme-preference')).toBe('light');
  }));
  it('uses os mode when preference is sync', () => {
    mockMatchMedia(true);
    const service = TestBed.runInInjectionContext(
      () => new ColorThemeService()
    );
    expect(service.mode()).toBe('dark');
  });
  it('honors explicit preference over os mode', () => {
    mockMatchMedia(true);
    const service = TestBed.runInInjectionContext(
      () => new ColorThemeService()
    );
    service.setPreference('light');
    expect(service.mode()).toBe('light');
  });
});
