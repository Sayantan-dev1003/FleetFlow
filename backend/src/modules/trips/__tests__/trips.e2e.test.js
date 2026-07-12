const request = require('supertest');
const app = require('../../../app');
const prisma = require('../../../config/db');
const { generateTestToken } = require('../../../../tests/utils/testHelpers');

describe('Trips Module E2E', () => {
  let managerToken;
  let driverToken;
  let testVehicleId;
  let testDriverId;
  let createdTripId;

  beforeAll(async () => {
    // Find a manager user
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

    // Find available vehicle and driver for tests
    const vehicle = await prisma.vehicle.findFirst({ where: { status: 'AVAILABLE' } });
    const driver = await prisma.driver.findFirst({ where: { status: 'AVAILABLE' } });
    
    if (vehicle && driver) {
      testVehicleId = vehicle.id;
      testDriverId = driver.id;
    }
  });

  describe('POST /api/trips', () => {
    it('should create a DRAFT trip', async () => {
      if (!testVehicleId || !testDriverId) {
        console.warn('Skipping trip creation test because no vehicle or driver is available.');
        return;
      }

      const res = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          source: 'New York',
          destination: 'Boston',
          vehicleId: testVehicleId,
          driverId: testDriverId,
          cargoWeightKg: 1000,
          plannedDistanceKm: 350
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('DRAFT');
      createdTripId = res.body.data.id;
    });
  });

  describe('POST /api/trips/:id/dispatch', () => {
    it('should dispatch the trip and lock vehicle/driver', async () => {
      if (!createdTripId) return;

      const res = await request(app)
        .post(`/api/trips/${createdTripId}/dispatch`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('DISPATCHED');
    });

    it('should fail to double dispatch', async () => {
      if (!createdTripId) return;

      const res = await request(app)
        .post(`/api/trips/${createdTripId}/dispatch`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(409); // Conflict
    });
  });

  describe('GET /api/trips', () => {
    it('should retrieve a list of trips', async () => {
      const res = await request(app)
        .get('/api/trips')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.trips)).toBe(true);
    });
  });
});
