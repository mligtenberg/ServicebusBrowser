import {
  app,
  Menu,
  MenuItemConstructorOptions,
  MenuItem,
  nativeTheme
} from 'electron'
import App from './app';

export function getMenu(isDev: boolean) {
  const isMac = process.platform === 'darwin';

  const macTemplate: Array<MenuItemConstructorOptions | MenuItem> = [
    // { role: 'appMenu' }
    {
      label: app.name,
      submenu: [
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
    },
    {
      role: 'editMenu'
    },
  ];

  const winLinTemplate: Array<MenuItemConstructorOptions | MenuItem> = [
    // { role: 'fileMenu' }
    {
      label: 'File',
      submenu: [
        {
          label: 'About ' + app.name,
          role: 'about'
        },
        { role: 'quit' }
      ]
    },
    {
      role: 'editMenu'
    }
  ];

  const sharedTemplate: Array<MenuItemConstructorOptions | MenuItem> = []

  if (isDev) {
    sharedTemplate.push({
      label: 'Development',
      submenu: [
        {
          label: 'Reload',
          role: 'reload'
        },
        {
          label: 'Toggle Developer Tools',
          role: 'toggleDevTools'
        }
      ]
    });
  }

  return Menu.buildFromTemplate([
    ...(isMac ? macTemplate : winLinTemplate),
    ...sharedTemplate
  ]);
}
