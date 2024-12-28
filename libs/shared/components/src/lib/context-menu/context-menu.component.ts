import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SbbMenuItem } from '@service-bus-browser/shared-contracts';
import { MenuItemCommandEvent } from 'primeng/api';
import { ContextMenu } from 'primeng/contextmenu';

@Component({
  selector: 'sbb-context-menu',
  imports: [CommonModule, ContextMenu],
  templateUrl: './context-menu.component.html',
  styleUrl: './context-menu.component.scss',
})
export class ContextMenuComponent<T> {
  data = input.required<T>();
  target = input.required<HTMLElement>();
  model = input.required<SbbMenuItem<T>[]>();
  contextMenuItems = computed(() => {
    return this.model()?.map((item) => {
      return {
        ...item,
        command: (event: MenuItemCommandEvent) => this.onSelect(event, item),
      };
    });
  });

  onSelect(event: MenuItemCommandEvent, menuItem: SbbMenuItem<T>) {
    menuItem.onSelect?.(this.data(), event);
  }
}
