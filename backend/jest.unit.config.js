module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js', '**/?(*.)+(spec|test).js'],
  testPathIgnorePatterns: ['/node_modules/', '\\.e2e\\.test\\.js$'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup/prismaMock.js'],
  clearMocks: true,
};
