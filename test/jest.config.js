/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.spec.ts'],
  moduleNameMapper: {
    '^@snaha/swarm-id$': '<rootDir>/__mocks__/@snaha/swarm-id.js',
    '^@ethersphere/bee-js$': '<rootDir>/__mocks__/@ethersphere/bee-js.js'
  }
};
