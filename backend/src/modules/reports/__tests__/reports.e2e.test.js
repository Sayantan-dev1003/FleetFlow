const request = require('supertest');
const app = require('../../../app');
const prisma = require('../../../config/db');
const { generateTestToken } = require('../../../../tests/utils/testHelpers');

describe('Reports Module E2E', () => {
  let analystToken;
  let driverToken;

  beforeAll(async () => {
    const analystUser = await prisma.user.findFirst({ where: { role: { name: 'FINANCIAL_ANALYST' } } });
    analystToken = analystUser ? generateTestToken('FINANCIAL_ANALYST', analystUser.id) : generateTestToken('FINANCIAL_ANALYST', '00000000-0000-0000-0000-000000000004');

    const driverUser = await prisma.user.findFirst({ where: { role: { name: 'DRIVER' } } });
    driverToken = driverUser ? generateTestToken('DRIVER', driverUser.id) : generateTestToken('DRIVER', '00000000-0000-0000-0000-000000000002');
  });

  describe('GET /api/reports/roi', () => {
    it('should allow Financial Analyst to view ROI report', async () => {
      const res = await request(app)
        .get('/api/reports/roi')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should deny Driver from viewing ROI report', async () => {
      const res = await request(app)
        .get('/api/reports/roi')
        .set('Authorization', `Bearer ${driverToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/reports/export', () => {
    it('should export report as CSV', async () => {
      const res = await request(app)
        .get('/api/reports/export?type=roi&format=csv')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(res.status).toBe(200);
      expect(res.header['content-type']).toContain('text/csv');
    });
  });
});
