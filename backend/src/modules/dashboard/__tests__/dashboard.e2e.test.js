const request = require('supertest');
const app = require('../../../app');
const prisma = require('../../../config/db');
const { generateTestToken } = require('../../../../tests/utils/testHelpers');

describe('Dashboard Module E2E', () => {
  let managerToken;

  beforeAll(async () => {
    const managerUser = await prisma.user.findFirst({ where: { role: { name: 'FLEET_MANAGER' } } });
    managerToken = managerUser ? generateTestToken('FLEET_MANAGER', managerUser.id) : generateTestToken('FLEET_MANAGER', '00000000-0000-0000-0000-000000000001');
  });

  describe('GET /api/dashboard/kpis', () => {
    it('should retrieve dashboard KPIs', async () => {
      const res = await request(app)
        .get('/api/dashboard/kpis')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('vehicles');
      expect(res.body.data).toHaveProperty('trips');
      expect(res.body.data).toHaveProperty('drivers');
      expect(res.body.data).toHaveProperty('fleetUtilizationPct');
    });
  });
});
