export default {
  displayName: 'main-ui',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  // messages-db pulls in a sqlite web-worker module that jest cannot compile;
  // main-ui only touches it transitively via messages-store, so stub it out.
  moduleNameMapper: {
    '^@service-bus-browser/messages-db$': '<rootDir>/src/messages-db-stub.ts',
    '^@zip.js/zip.js$': '<rootDir>/src/zip-js-stub.ts',
  },
  coverageDirectory: '../../coverage/libs/main-ui',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
