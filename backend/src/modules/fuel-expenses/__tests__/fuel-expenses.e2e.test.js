const request = require('supertest');
const app = require('../../../app');
const prisma = require('../../../config/db');
const { generateTestToken } = require('../../../../tests/utils/testHelpers');

describe('Fuel/Expenses Module E2E', () => {
  let managerToken;
  let driverToken;
  let analystToken;
  let testVehicleId;

  beforeAll(async () => {
    const managerUser = await prisma.user.findFirst({ where: { role: { name: 'FLEET_MANAGER' } } });
    managerToken = managerUser ? generateTestToken('FLEET_MANAGER', managerUser.id) : generateTestToken('FLEET_MANAGER', '00000000-0000-0000-0000-000000000001');

    const driverUser = await prisma.user.findFirst({ where: { role: { name: 'DRIVER' } } });
    driverToken = driverUser ? generateTestToken('DRIVER', driverUser.id) : generateTestToken('DRIVER', '00000000-0000-0000-0000-000000000002');

    const analystUser = await prisma.user.findFirst({ where: { role: { name: 'FINANCIAL_ANALYST' } } });
    analystToken = analystUser ? generateTestToken('FINANCIAL_ANALYST', analystUser.id) : generateTestToken('FINANCIAL_ANALYST', '00000000-0000-0000-0000-000000000004');

    const vehicle = await prisma.vehicle.findFirst({ where: { status: 'AVAILABLE' } });
    if (vehicle) testVehicleId = vehicle.id;
  });

  describe('POST /api/fuel-logs', () => {
    it('should allow Driver to create a fuel log', async () => {
      if (!testVehicleId) return;

      const res = await request(app)
        .post('/api/fuel-logs')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          vehicleId: testVehicleId,
          liters: 40,
          cost: 120
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should deny Financial Analyst from creating a fuel log', async () => {
      if (!testVehicleId) return;

      const res = await request(app)
        .post('/api/fuel-logs')
        .set('Authorization', `Bearer ${analystToken}`)
        .send({
          vehicleId: testVehicleId,
          liters: 40,
          cost: 120
        });

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/expenses', () => {
    it('should allow Financial Analyst to create an expense', async () => {
      if (!testVehicleId) return;

      const res = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${analystToken}`)
        .send({
          vehicleId: testVehicleId,
          type: 'TOLL',
          amount: 25,
          description: 'Highway toll'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should deny Driver from creating an expense', async () => {
      if (!testVehicleId) return;

      const res = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          vehicleId: testVehicleId,
          type: 'TOLL',
          amount: 25
        });

      expect(res.status).toBe(403);
    });
  });
});
