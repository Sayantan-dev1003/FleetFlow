const request = require('supertest');
const app = require('../../../app');
const prisma = require('../../../config/db');
const { generateTestToken } = require('../../../../tests/utils/testHelpers');

describe('Maintenance Module E2E', () => {
  let managerToken;
  let driverToken;
  let testVehicleId;
  let createdMaintenanceId;

  beforeAll(async () => {
    const managerUser = await prisma.user.findFirst({ where: { role: { name: 'FLEET_MANAGER' } } });
    if (managerUser) {
      managerToken = generateTestToken('FLEET_MANAGER', managerUser.id);
    } else {
      managerToken = generateTestToken('FLEET_MANAGER', '00000000-0000-0000-0000-000000000001');
    }

    const driverUser = await prisma.user.findFirst({ where: { role: { name: 'DRIVER' } } });
    if (driverUser) {
      driverToken = generateTestToken('DRIVER', driverUser.id);
    } else {
      driverToken = generateTestToken('DRIVER', '00000000-0000-0000-0000-000000000002');
    }

    // Find available vehicle for tests
    const vehicle = await prisma.vehicle.findFirst({ where: { status: 'AVAILABLE' } });
    if (vehicle) {
      testVehicleId = vehicle.id;
    }
  });

  describe('POST /api/maintenance', () => {
    it('should allow Fleet Manager to open maintenance', async () => {
      if (!testVehicleId) return;

      const res = await request(app)
        .post('/api/maintenance')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          vehicleId: testVehicleId,
          type: 'ROUTINE',
          description: 'Oil change',
          cost: 150
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('OPEN');
      createdMaintenanceId = res.body.data.id;
    });

    it('should deny Driver from opening maintenance', async () => {
      if (!testVehicleId) return;

      const res = await request(app)
        .post('/api/maintenance')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          vehicleId: testVehicleId,
          type: 'REPAIR',
        });

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/maintenance/:id/close', () => {
    it('should allow Fleet Manager to close maintenance', async () => {
      if (!createdMaintenanceId) return;

      const res = await request(app)
        .post(`/api/maintenance/${createdMaintenanceId}/close`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ cost: 200 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('CLOSED');
    });
  });
});
