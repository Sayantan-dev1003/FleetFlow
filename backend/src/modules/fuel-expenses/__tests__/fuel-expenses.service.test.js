const { prismaMock } = require('../../../../tests/setup/prismaMock');
const fuelExpenseService = require('../service');
const ApiError = require('../../../utils/ApiError');

describe('Fuel Expenses Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createFuelLog', () => {
    it('should throw error if vehicle is RETIRED', async () => {
      prismaMock.vehicle.findUnique.mockResolvedValue({ id: 'v1', status: 'RETIRED' });
      await expect(fuelExpenseService.createFuelLog({ vehicleId: 'v1', liters: 50, cost: 100 })).rejects.toThrow(ApiError);
    });

    it('should throw error if tripId does not match vehicleId', async () => {
      prismaMock.vehicle.findUnique.mockResolvedValue({ id: 'v1', status: 'AVAILABLE' });
      prismaMock.trip.findUnique.mockResolvedValue({ id: 't1', vehicleId: 'v2' });
      
      await expect(
        fuelExpenseService.createFuelLog({ vehicleId: 'v1', tripId: 't1', liters: 50, cost: 100 })
      ).rejects.toThrow(ApiError);
    });
  });

  describe('getOperationalCost', () => {
    it('should aggregate fuel, maintenance, and expenses', async () => {
      prismaMock.vehicle.findUnique.mockResolvedValue({ id: 'v1', acquisitionCost: 50000 });
      
      prismaMock.fuelLog.aggregate.mockResolvedValue({ _sum: { cost: 100, liters: 50 }, _count: 1 });
      prismaMock.maintenanceLog.aggregate.mockResolvedValue({ _sum: { cost: 200 }, _count: 1 });
      prismaMock.expense.aggregate.mockResolvedValue({ _sum: { amount: 50 }, _count: 1 });

      const result = await fuelExpenseService.getOperationalCost('v1');
      expect(result.totalOperationalCost).toBe(350);
      expect(result.breakdown.fuelCost).toBe(100);
      expect(result.breakdown.maintenanceCost).toBe(200);
      expect(result.breakdown.otherExpenses).toBe(50);
    });
  });
});
