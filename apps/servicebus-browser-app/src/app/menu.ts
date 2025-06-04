import {
  app,
  Menu,
  MenuItemConstructorOptions,
  MenuItem,
  nativeTheme
} from 'electron'
import App from './app';
import UpdateEvents from './events/update.events';

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
        {
          label: 'Check for Updates...',
          click: () => {
            UpdateEvents.checkForUpdates();
          }
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
        {
          label: 'Check for Updates...',
          click: () => {
            UpdateEvents.checkForUpdates();
          }
        },
        { role: 'quit' }
      ]
    },
    {
      role: 'editMenu'
    }
  ];

  const sharedTemplate: Array<MenuItemConstructorOptions | MenuItem> = [
    {
      label: 'Settings',
      submenu: [
        {
          label: 'Preferred color scheme',
          submenu: [
            {
              label: 'System',
              type: 'radio',
              checked: App.getTheme() === 'system',
              click: () => {
                App.setTheme('system');
              }
            },
            {
              label: 'Dark',
              type: 'radio',
              checked: App.getTheme() === 'dark',
              click: () => {
                App.setTheme('dark');
              }
            },
            {
              label: 'Light',
              type: 'radio',
              checked: App.getTheme() === 'light',
              click: () => {
                App.setTheme('light');
              }
            }
          ]
        }
      ]
    }
  ]

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
