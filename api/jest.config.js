export const testEnvironment = 'node';
export const clearMocks = true;
export const roots = ['<rootDir>'];
export const coverageDirectory = 'coverage';
export const setupFiles = [
  './test/jestSetup.js',
  './test/__mocks__/KeyvMongo.js',
  './test/__mocks__/logger.js',
  './test/__mocks__/fetchEventSource.js',
];
export const moduleNameMapper = {
  '~/(.*)': '<rootDir>/$1',
  '~/data/auth.json': '<rootDir>/__mocks__/auth.mock.json',
};
