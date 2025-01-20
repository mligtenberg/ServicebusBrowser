import { MenuItem } from 'primeng/api';
import { MenuItemCommandEvent } from 'primeng/api/menuitem';

export type SbbMenuItem<T> = MenuItem & {
  onSelect?(data: T, event: MenuItemCommandEvent): void
  supportedMultiSelection?: false,
  menuItems?: SbbMenuItem<T>[]
} | MenuItem & {
  onSelect?(data: T | T[], event: MenuItemCommandEvent): void
  supportedMultiSelection: true
  menuItems?: SbbMenuItem<T>[]
}
