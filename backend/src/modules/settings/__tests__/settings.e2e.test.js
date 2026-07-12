const request = require('supertest');
const app = require('../../../app');
const prisma = require('../../../config/db');
const { generateTestToken } = require('../../../../tests/utils/testHelpers');

describe('Settings Module E2E', () => {
  let managerToken;
  let driverToken;

  beforeAll(async () => {
    const managerUser = await prisma.user.findFirst({ where: { role: { name: 'FLEET_MANAGER' } } });
    managerToken = managerUser ? generateTestToken('FLEET_MANAGER', managerUser.id) : generateTestToken('FLEET_MANAGER', '00000000-0000-0000-0000-000000000001');

    const driverUser = await prisma.user.findFirst({ where: { role: { name: 'DRIVER' } } });
    driverToken = driverUser ? generateTestToken('DRIVER', driverUser.id) : generateTestToken('DRIVER', '00000000-0000-0000-0000-000000000002');
  });

  describe('GET /api/settings', () => {
    it('should retrieve settings for any authenticated user', async () => {
      const res = await request(app)
        .get('/api/settings')
        .set('Authorization', `Bearer ${driverToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('depotName');
    });
  });

  describe('PUT /api/settings', () => {
    it('should allow Fleet Manager to update settings', async () => {
      const res = await request(app)
        .put('/api/settings')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          depotName: 'New Central Depot'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.depotName).toBe('New Central Depot');
    });

    it('should deny Driver from updating settings', async () => {
      const res = await request(app)
        .put('/api/settings')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          depotName: 'Hacked Depot'
        });

      expect(res.status).toBe(403);
    });
  });
});
