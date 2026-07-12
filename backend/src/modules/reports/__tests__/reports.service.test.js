const { prismaMock } = require('../../../../tests/setup/prismaMock');
const reportsService = require('../service');

describe('Reports Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getFleetUtilizationReport', () => {
    it('should calculate fleet utilization', async () => {
      prismaMock.vehicle.count
        .mockResolvedValueOnce(5) // onTripCount
        .mockResolvedValueOnce(10); // nonRetiredCount

      prismaMock.vehicle.groupBy.mockResolvedValue([
        { status: 'AVAILABLE', _count: { id: 5 } },
        { status: 'ON_TRIP', _count: { id: 5 } }
      ]);

      const result = await reportsService.getFleetUtilizationReport();
      expect(result.fleetUtilizationPct).toBe(50);
      expect(result.activeVehicles).toBe(5);
      expect(result.totalNonRetiredVehicles).toBe(10);
    });
  });

  describe('getRoiReport', () => {
    it('should calculate ROI', async () => {
      prismaMock.vehicle.findMany.mockResolvedValue([{ id: 'v1', acquisitionCost: 50000 }]);
      
      prismaMock.trip.groupBy.mockResolvedValue([{ vehicleId: 'v1', _sum: { revenue: 10000 }, _count: { id: 5 } }]);
      prismaMock.fuelLog.groupBy.mockResolvedValue([{ vehicleId: 'v1', _sum: { cost: 1000 } }]);
      prismaMock.maintenanceLog.groupBy.mockResolvedValue([{ vehicleId: 'v1', _sum: { cost: 2000 } }]);

      const result = await reportsService.getRoiReport();
      expect(result[0].roiPct).toBe(14); // (10000 - 3000) / 50000 * 100
      expect(result[0].netProfit).toBe(7000);
    });
  });
});
