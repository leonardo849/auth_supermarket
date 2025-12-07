const { pathsToModuleNameMapper } = require('ts-jest')
const { compilerOptions } = require('./tsconfig.json')

module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true,
      tsconfig: './tsconfig.json'
    }]
  },
  moduleNameMapper: pathsToModuleNameMapper(
    compilerOptions.paths || {},
    { prefix: '<rootDir>/' }
  ),
  testMatch: ['**/?(*.)+(spec|test).[tj]s'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testPathIgnorePatterns: ["src/main.ts"]
}
