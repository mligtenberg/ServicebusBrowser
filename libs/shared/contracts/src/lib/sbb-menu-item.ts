import { MenuItem } from 'primeng/api';
import { MenuItemCommandEvent } from 'primeng/api/menuitem';

export interface SbbMenuItem<T> extends MenuItem {
  onSelect?(data: T, event: MenuItemCommandEvent): void
}
