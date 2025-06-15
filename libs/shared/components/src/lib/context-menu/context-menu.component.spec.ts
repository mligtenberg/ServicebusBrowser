import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContextMenuComponent } from './context-menu.component';
import { SbbMenuItem } from '@service-bus-browser/shared-contracts';

@Component({
  template: `<sbb-context-menu [data]="data" [target]="target" [model]="items"></sbb-context-menu>`,
  standalone: true,
  imports: [ContextMenuComponent]
})
class HostComponent {
  data: any = {};
  target = document.createElement('div');
  items: SbbMenuItem<any>[] = [];
}

describe('ContextMenuComponent', () => {
  let host: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let component: ContextMenuComponent<any>;

  beforeEach(async () => {
    (window as any).matchMedia = (query: string) => ({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    });
    await TestBed.configureTestingModule({
      imports: [HostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    component = fixture.debugElement.children[0].componentInstance;
  });

  it('wraps menu item commands', () => {
    const spy = jest.fn();
    host.data = { id: 1 };
    host.items = [{ label: 'test', onSelect: spy }];
    fixture.detectChanges();

    const menuItems = component.contextMenuItems();
    menuItems[0].command!({} as any);
    expect(spy).toHaveBeenCalledWith(host.data, expect.anything());
  });
});
