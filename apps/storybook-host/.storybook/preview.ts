import type { Preview } from '@storybook/angular-vite';
import { applicationConfig } from '@storybook/angular-vite';
import { provideZonelessChangeDetection } from '@angular/core';

// Global styles required for `sbb` components to render faithfully:

//   - cdk overlay    positions/backdrops overlay components (select, dialog,
//                    autocomplete, popover, menu). Without it overlays render
//                    unpositioned.
//   - preview-styles the `--sbb-*` design tokens + base font (mirrors the app's
//                    styles.scss, minus monaco).

import '@angular/cdk/overlay-prebuilt.css';
import './preview-styles.scss';

const preview: Preview = {
  decorators: [
    // The app is zoneless (see app.config.ts). Signal-driven CD only works if
    // the story bootstrap matches; without this, inputs/computed won't update.
    applicationConfig({
      providers: [provideZonelessChangeDetection()],
    }),
    // Theme is driven by the native CSS `color-scheme` property on <html>
    // (semantic tokens use `light-dark()`), exactly like ColorThemeService.
    // Toggle it from the toolbar, or address it via URL: `&globals=theme:dark`.
    (storyFn, context) => {
      const theme = (context.globals['theme'] as string) ?? 'light';
      document.documentElement.style.colorScheme =
        theme === 'auto' ? 'light dark' : theme;
      return storyFn();
    },
  ],
  globalTypes: {
    theme: {
      description:
        'Color theme (drives CSS color-scheme / light-dark() tokens)',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
          { value: 'auto', title: 'Auto (OS)' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'error',
    },
  },
};

export default preview;
