import { app, Menu, MenuItemConstructorOptions, MenuItem } from 'electron'

const isMac = process.platform === 'darwin';

const macTemplate: Array<MenuItemConstructorOptions | MenuItem> = [
  // { role: 'appMenu' }
  {
    label: app.name,
    submenu: [
      {
        label: 'About ' + app.name,
        role: 'about'
      },
      { type: 'separator' },
      {
        label: 'Quit ' + app.name,
        role: 'quit'
      }
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

const winLinTemplate: Array<MenuItemConstructorOptions | MenuItem> = [
  // { role: 'fileMenu' }
  {
    label: 'File',
    submenu: [
      { role: 'quit' }
    ]
  }
];

export const menu = Menu.buildFromTemplate(isMac ? macTemplate : winLinTemplate);
