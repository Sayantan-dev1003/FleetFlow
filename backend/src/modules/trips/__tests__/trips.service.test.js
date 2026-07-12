const { prismaMock } = require('../../../../tests/setup/prismaMock');
const tripService = require('../service');
const ApiError = require('../../../utils/ApiError');

describe('Trip Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTrip', () => {
    it('should create a trip if vehicle and driver are eligible', async () => {
      const mockVehicle = { id: 'v1', status: 'AVAILABLE', maxLoadCapacityKg: 5000 };
      const mockDriver = { 
        id: 'd1', 
        status: 'AVAILABLE', 
        licenseExpiryDate: new Date(Date.now() + 86400000 * 10) 
      };

      prismaMock.vehicle.findUnique.mockResolvedValue(mockVehicle);
      prismaMock.driver.findUnique.mockResolvedValue(mockDriver);
      prismaMock.trip.create.mockResolvedValue({ id: 't1', status: 'DRAFT' });

      const result = await tripService.createTrip({
        vehicleId: 'v1',
        driverId: 'd1',
        cargoWeightKg: 4000,
      }, 'user1');

      expect(result).toHaveProperty('id', 't1');
    });

    it('should throw error if cargo exceeds capacity', async () => {
      const mockVehicle = { id: 'v1', status: 'AVAILABLE', maxLoadCapacityKg: 5000 };
      const mockDriver = { 
        id: 'd1', 
        status: 'AVAILABLE', 
        licenseExpiryDate: new Date(Date.now() + 86400000 * 10) 
      };

      prismaMock.vehicle.findUnique.mockResolvedValue(mockVehicle);
      prismaMock.driver.findUnique.mockResolvedValue(mockDriver);

      await expect(
        tripService.createTrip({ vehicleId: 'v1', driverId: 'd1', cargoWeightKg: 6000 }, 'user1')
      ).rejects.toThrow(ApiError);
    });
  });

  describe('dispatchTrip', () => {
    it('should fail if trip is already DISPATCHED', async () => {
      prismaMock.trip.findUnique.mockResolvedValue({ id: 't1', status: 'DISPATCHED' });
      await expect(tripService.dispatchTrip('t1')).rejects.toThrow(ApiError);
    });

    // We skip testing the internal transaction logic because it requires complex 
    // mock setups for prisma.$transaction. E2E tests will cover this effectively.
  });
});
