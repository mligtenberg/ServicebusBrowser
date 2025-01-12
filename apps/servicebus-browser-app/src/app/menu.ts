import { app, Menu, MenuItemConstructorOptions, MenuItem } from 'electron'

const isMac = process.platform === 'darwin';

const macTemplate: Array<MenuItemConstructorOptions | MenuItem> = [
  // { role: 'appMenu' }
  {
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  },
  // { role: 'fileMenu' }
  {
    label: 'File',
    submenu: [
      { role: 'close' }
    ]
  }
];

const winlinTemplate: Array<MenuItemConstructorOptions | MenuItem> = [
  // { role: 'fileMenu' }
  {
    label: 'File',
    submenu: [
      { role: 'quit' }
    ]
  }
];

export const menu = Menu.buildFromTemplate(isMac ? macTemplate : winlinTemplate);
