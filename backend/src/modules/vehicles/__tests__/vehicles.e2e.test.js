const request = require('supertest');
const app = require('../../../app');
const { generateTestToken } = require('../../../../tests/utils/testHelpers');

describe('Vehicles Module E2E', () => {
  let managerToken;
  let driverToken;
  let createdVehicleId;

  beforeAll(async () => {
    const managerUser = await require('../../../config/db').user.findFirst({ where: { role: { name: 'FLEET_MANAGER' } } });
    if (managerUser) {
      managerToken = generateTestToken('FLEET_MANAGER', managerUser.id);
    } else {
      managerToken = generateTestToken('FLEET_MANAGER', '00000000-0000-0000-0000-000000000001');
    }

    const driverUser = await require('../../../config/db').user.findFirst({ where: { role: { name: 'DRIVER' } } });
    if (driverUser) {
      driverToken = generateTestToken('DRIVER', driverUser.id);
    } else {
      driverToken = generateTestToken('DRIVER', '00000000-0000-0000-0000-000000000002');
    }
  });

  describe('POST /api/vehicles', () => {
    it('should allow Fleet Manager to create a vehicle', async () => {
      const regNum = `TEST-${Date.now()}`;
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          registrationNumber: regNum,
          name: 'E2E Test Truck',
          type: 'Light',
          maxLoadCapacityKg: 2000,
          acquisitionCost: 50000,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.registrationNumber).toBe(regNum);
      createdVehicleId = res.body.data.id;
    });

    it('should deny Driver from creating a vehicle', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          registrationNumber: 'TEST-5678',
          name: 'Another Truck',
          type: 'Medium',
          maxLoadCapacityKg: 3000,
          acquisitionCost: 60000,
        });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/vehicles', () => {
    it('should allow anyone to read vehicles list', async () => {
      const res = await request(app)
        .get('/api/vehicles')
        .set('Authorization', `Bearer ${driverToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.vehicles)).toBe(true);
    });
  });

  describe('DELETE /api/vehicles/:id', () => {
    it('should allow Fleet Manager to retire a vehicle', async () => {
      const res = await request(app)
        .delete(`/api/vehicles/${createdVehicleId}`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.vehicle.status).toBe('RETIRED');
    });
  });
});
