const { mockDeep, mockReset } = require('jest-mock-extended');
const prisma = require('../../src/config/db');

jest.mock('../../src/config/db', () => mockDeep());

beforeEach(() => {
  mockReset(prisma);
});

module.exports = { prismaMock: prisma };
