module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.e2e.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup/setupE2E.js'],
  clearMocks: true,
};
