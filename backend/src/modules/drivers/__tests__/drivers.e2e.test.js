const request = require('supertest');
const app = require('../../../app');
const { generateTestToken } = require('../../../../tests/utils/testHelpers');

describe('Drivers Module E2E', () => {
  let managerToken;
  let safetyToken;
  let driverToken;
  let createdDriverId;
  beforeAll(async () => {
    const managerUser = await require('../../../config/db').user.findFirst({ where: { role: { name: 'FLEET_MANAGER' } } });
    if (managerUser) {
      managerToken = generateTestToken('FLEET_MANAGER', managerUser.id);
    } else {
      managerToken = generateTestToken('FLEET_MANAGER', '00000000-0000-0000-0000-000000000001');
    }

    const safetyUser = await require('../../../config/db').user.findFirst({ where: { role: { name: 'SAFETY_OFFICER' } } });
    if (safetyUser) {
      safetyToken = generateTestToken('SAFETY_OFFICER', safetyUser.id);
    } else {
      safetyToken = generateTestToken('SAFETY_OFFICER', '00000000-0000-0000-0000-000000000003');
    }

    const driverUser = await require('../../../config/db').user.findFirst({ where: { role: { name: 'DRIVER' } } });
    if (driverUser) {
      driverToken = generateTestToken('DRIVER', driverUser.id);
    } else {
      driverToken = generateTestToken('DRIVER', '00000000-0000-0000-0000-000000000002');
    }
  });

  describe('POST /api/drivers', () => {
    it('should allow Safety Officer to create a driver', async () => {
      const res = await request(app)
        .post('/api/drivers')
        .set('Authorization', `Bearer ${safetyToken}`)
        .send({
          name: 'E2E Test Driver',
          licenseNumber: `DL-${Date.now()}`,
          licenseCategory: 'HC',
          licenseExpiryDate: new Date(Date.now() + 86400000 * 365).toISOString(),
          contactNumber: '1234567890',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      createdDriverId = res.body.data.id;
    });

    it('should deny Driver role from creating a driver', async () => {
      const res = await request(app)
        .post('/api/drivers')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          name: 'Forbidden Driver',
          licenseNumber: `DL-${Date.now()}`,
          licenseCategory: 'HC',
          licenseExpiryDate: new Date(Date.now() + 86400000 * 365).toISOString(),
        });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/drivers', () => {
    it('should retrieve a list of drivers', async () => {
      const res = await request(app)
        .get('/api/drivers')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.drivers)).toBe(true);
    });
  });
});
