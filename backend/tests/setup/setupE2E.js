require('dotenv').config({ path: '.env.test' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

beforeAll(async () => {
  // Try to run migrations or just clean tables if migrations are already run
});

afterAll(async () => {
  await prisma.$disconnect();
});
