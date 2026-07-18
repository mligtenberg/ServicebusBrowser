import type { StorybookConfig } from '@storybook/angular-vite';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const workspaceRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../..'
);

/**
 * Map the workspace's `@service-bus-browser/*` TS path aliases to Vite
 * `resolve.alias` entries. The Angular compiler honours these via the
 * `.storybook/tsconfig.json`, but Vite's own module resolver doesn't read
 * `tsconfig` paths — so any story importing a lib by alias (rather than a
 * relative path) fails to resolve without this. Reading `tsconfig.base.json`
 * keeps the single source of truth; the alternative (vite-tsconfig-paths /
 * @nx/vite) would add a dependency for what is a handful of lines here.
 */
function tsconfigPathAliases(): { find: RegExp; replacement: string }[] {
  const { compilerOptions } = JSON.parse(
    readFileSync(resolve(workspaceRoot, 'tsconfig.base.json'), 'utf-8')
  );
  return Object.entries(compilerOptions.paths as Record<string, string[]>).map(
    ([alias, [target]]) => ({
      // Exact-match the bare alias (none of these use `/*` wildcards).
      find: new RegExp(`^${alias}$`),
      replacement: resolve(workspaceRoot, target),
    })
  );
}

/**
 * Single "host" Storybook for the presentational UI layer.
 *
 * Stories live colocated with their components; this config globs them from
 * both in-scope libraries. Keep the scope limited to presentational libs
 * (`shared-ui`, stateless `shared/components`) — connected components would
 * need mocked store/service/router providers per story.
 */
const config: StorybookConfig = {
  framework: {
    name: '@storybook/angular-vite',
    // Compodoc (JSDoc -> docs/argTypes) is off: argTypes are declared
    // explicitly per story and Storybook infers the rest from `input()`
    // signatures. Enable it (and add @compodoc/compodoc) if richer autodocs
    // from the components' JSDoc become worthwhile.
    options: {
      compodoc: false,
    },
  },
  stories: [
    '../../../libs/shared/ui/src/**/*.stories.@(ts|mdx)',
    '../../../libs/shared/components/src/**/*.stories.@(ts|mdx)',
    '../../../libs/logs/components/src/**/*.stories.@(ts|mdx)',
    '../../../libs/main-ui/src/lib/home/**/*.stories.@(ts|mdx)',
    // PROTOTYPE ONLY — Q5 connection-layout demo. Remove this line when
    // `libs/connections/flow/src/lib/prototype-layout-demo` is deleted.
    '../../../libs/connections/flow/src/lib/prototype-layout-demo/**/*.stories.@(ts|mdx)',
  ],
  addons: ['@storybook/addon-vitest', '@storybook/addon-a11y'],
  viteFinal: (viteConfig) => {
    viteConfig.resolve ??= {};
    viteConfig.resolve.alias = [
      ...(Array.isArray(viteConfig.resolve.alias)
        ? viteConfig.resolve.alias
        : []),
      ...tsconfigPathAliases(),
    ];
    return viteConfig;
  },
};

export default config;
