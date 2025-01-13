import { app, Menu, MenuItemConstructorOptions, MenuItem } from 'electron'

export function getMenu(isDev: boolean) {
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
        },
        ...(isDev ? [
          {
            type: 'separator'
          } as MenuItemConstructorOptions,
          {
            role: 'reload'
          } as MenuItemConstructorOptions,
          {
            role: 'toggleDevTools'
          } as MenuItemConstructorOptions
        ] : [])
      ]
    },
    // { role: 'fileMenu' }
    {
      label: 'File',
      submenu: [
        { role: 'close' }
      ]
    },
    {
      role: 'editMenu'
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

  return Menu.buildFromTemplate(isMac ? macTemplate : winLinTemplate);
}
