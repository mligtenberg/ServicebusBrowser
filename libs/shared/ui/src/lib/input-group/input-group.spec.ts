import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SbbInputGroup } from './input-group';
import { SbbInputGroupAddon } from './input-group-addon';

@Component({
  imports: [SbbInputGroup, SbbInputGroupAddon],
  template: `
    <sbb-input-group>
      <sbb-input-group-addon>
        <button type="button" class="leading-btn">clear</button>
      </sbb-input-group-addon>
      <input class="projected-input" [value]="value" />
      <sbb-input-group-addon>
        <button type="button" class="trailing-btn">search</button>
      </sbb-input-group-addon>
    </sbb-input-group>
  `,
})
class HostComponent {
  value = 'hello';
}

describe('SbbInputGroup + SbbInputGroupAddon', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('renders as a native custom element with the sbb- selectors', () => {
    const group = fixture.debugElement.query(By.directive(SbbInputGroup));
    const addons = fixture.debugElement.queryAll(
      By.directive(SbbInputGroupAddon),
    );

    expect(group).toBeTruthy();
    expect(addons.length).toBe(2);
  });

  it('applies the sbb-input-group host class for styling hooks', () => {
    const group = fixture.debugElement.query(By.directive(SbbInputGroup));
    expect(
      (group.nativeElement as HTMLElement).classList.contains(
        'sbb-input-group',
      ),
    ).toBe(true);
  });

  it('applies the sbb-input-group-addon host class on each addon', () => {
    const addons = fixture.debugElement.queryAll(
      By.directive(SbbInputGroupAddon),
    );
    for (const addon of addons) {
      expect(
        (addon.nativeElement as HTMLElement).classList.contains(
          'sbb-input-group-addon',
        ),
      ).toBe(true);
    }
  });

  it('projects arbitrary content inside the group and preserves DOM order (leading/trailing addons)', () => {
    const host: HTMLElement = fixture.nativeElement;
    const group = host.querySelector('sbb-input-group') as HTMLElement;

    // Leading addon, then the projected input, then the trailing addon —
    // ordering in the DOM is what determines visual leading/trailing
    // position since the component is purely structural.
    const children = Array.from(group.children);
    expect(children[0].tagName.toLowerCase()).toBe('sbb-input-group-addon');
    expect(children[1].tagName.toLowerCase()).toBe('input');
    expect(children[2].tagName.toLowerCase()).toBe('sbb-input-group-addon');
  });

  it('projects the addon content itself (e.g. a button) unchanged', () => {
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('.leading-btn')?.textContent?.trim()).toBe(
      'clear',
    );
    expect(host.querySelector('.trailing-btn')?.textContent?.trim()).toBe(
      'search',
    );
  });

  it('does not implement ControlValueAccessor or otherwise act as a form control', () => {
    // Structural-only: no value/formControl inputs, no CVA registration point.
    const group = new SbbInputGroup();
    expect((group as unknown as { writeValue?: unknown }).writeValue).toBeUndefined();
    const addon = new SbbInputGroupAddon();
    expect((addon as unknown as { writeValue?: unknown }).writeValue).toBeUndefined();
  });

  it('leaves the projected input fully usable (value intact, not wrapped/altered)', () => {
    const input = fixture.debugElement.query(
      By.css('.projected-input'),
    ).nativeElement as HTMLInputElement;
    expect(input.value).toBe('hello');
  });
});
