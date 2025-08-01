import { MenuItem, MenuItemCommandEvent } from 'primeng/api';

export type SbbMenuItem<T> = MenuItem & {
  onSelect?(data: T, event: MenuItemCommandEvent): void
  supportedMultiSelection?: false,
  menuItems?: SbbMenuItem<T>[]
} | MenuItem & {
  onSelect?(data: T | T[], event: MenuItemCommandEvent): void
  supportedMultiSelection: true
  menuItems?: SbbMenuItem<T>[]
}
