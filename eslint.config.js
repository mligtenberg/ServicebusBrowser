const nx = require('@nx/eslint-plugin');

module.exports = [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
  {
    // The UI-primitive ban applies everywhere EXCEPT the shared-ui design-system lib.
    // shared-ui is the single place allowed to depend on @spartan-ng/brain and @angular/cdk;
    // every other project must consume those only through shared-ui's wrappers.
    // nx accumulates bannedExternalImports across all matching depConstraints and there is no
    // per-tag exception to a `*` ban, so shared-ui is excluded here via flat-config `ignores`.
    // NOTE: `primeng` is deliberately NOT banned yet — it is still imported by unmigrated feature
    // libs during coexistence. Add it to bannedExternalImports once the last primeng import is gone.
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    ignores: ['libs/shared/ui/**'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
              bannedExternalImports: ['@spartan-ng/brain', '@spartan-ng/brain/*', '@angular/cdk', '@angular/cdk/*'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {},
  },
];
