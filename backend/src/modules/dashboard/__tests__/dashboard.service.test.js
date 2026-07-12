const { prismaMock } = require('../../../../tests/setup/prismaMock');
const dashboardService = require('../service');

describe('Dashboard Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getKpis', () => {
    it('should return aggregated KPIs', async () => {
      // Mock the concurrent promise queries
      prismaMock.vehicle.count
        .mockResolvedValueOnce(5) // activeVehicles
        .mockResolvedValueOnce(10) // availableVehicles
        .mockResolvedValueOnce(2) // vehiclesInMaintenance
        .mockResolvedValueOnce(1) // retiredVehicles
        .mockResolvedValueOnce(17); // totalNonRetiredVehicles

      prismaMock.trip.count
        .mockResolvedValueOnce(5) // activeTrips
        .mockResolvedValueOnce(3) // pendingTrips
        .mockResolvedValueOnce(1); // completedTripsToday

      prismaMock.driver.count
        .mockResolvedValueOnce(5) // driversOnDuty
        .mockResolvedValueOnce(8); // totalAvailableDrivers

      const result = await dashboardService.getKpis();

      expect(result.vehicles.active).toBe(5);
      expect(result.vehicles.available).toBe(10);
      expect(result.fleetUtilizationPct).toBe(29.41); // (5/17)*100
      expect(result.trips.active).toBe(5);
      expect(result.drivers.available).toBe(8);
    });

    it('should return 0 utilization when no vehicles', async () => {
      prismaMock.vehicle.count.mockResolvedValue(0);
      prismaMock.trip.count.mockResolvedValue(0);
      prismaMock.driver.count.mockResolvedValue(0);

      const result = await dashboardService.getKpis();
      expect(result.fleetUtilizationPct).toBe(0);
    });
  });
});
