/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  // [...]
  preset: 'ts-jest/presets/default-esm', // or other ESM presets
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
    // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  automock: false,

  // This will setup the prerequisites for the tests to run
  // globalSetup: './tests-setup.ts',
  testTimeout: 360000,
  rootDir: 'test',
}
