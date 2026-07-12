const { prismaMock } = require('../../../../tests/setup/prismaMock');
const vehicleService = require('../service');
const ApiError = require('../../../utils/ApiError');

describe('Vehicle Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createVehicle', () => {
    it('should create a new vehicle', async () => {
      const mockData = {
        registrationNumber: 'AB1234',
        name: 'Test Truck',
        type: 'Heavy',
        maxLoadCapacityKg: 5000,
        acquisitionCost: 100000,
      };

      prismaMock.vehicle.create.mockResolvedValue({
        id: 'v1',
        ...mockData,
        status: 'AVAILABLE',
      });

      const result = await vehicleService.createVehicle(mockData);

      expect(result).toHaveProperty('id', 'v1');
      expect(result.status).toBe('AVAILABLE');
      expect(prismaMock.vehicle.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            registrationNumber: 'AB1234',
            status: 'AVAILABLE',
          })
        })
      );
    });
  });

  describe('updateVehicle', () => {
    it('should throw conflict error if trying to update an ON_TRIP vehicle status', async () => {
      prismaMock.vehicle.findUnique.mockResolvedValue({ id: 'v1', status: 'ON_TRIP' });

      await expect(
        vehicleService.updateVehicle('v1', { status: 'AVAILABLE' })
      ).rejects.toThrow(ApiError);
    });

    it('should update vehicle if conditions are met', async () => {
      prismaMock.vehicle.findUnique.mockResolvedValue({ id: 'v1', status: 'AVAILABLE' });
      prismaMock.vehicle.update.mockResolvedValue({ id: 'v1', status: 'RETIRED' });

      const result = await vehicleService.updateVehicle('v1', { status: 'RETIRED' });
      expect(result.status).toBe('RETIRED');
    });
  });

  describe('deleteVehicle', () => {
    it('should throw error if trying to retire an ON_TRIP vehicle', async () => {
      prismaMock.vehicle.findUnique.mockResolvedValue({ id: 'v1', status: 'ON_TRIP' });

      await expect(vehicleService.deleteVehicle('v1')).rejects.toThrow(ApiError);
    });

    it('should soft-delete vehicle by setting status to RETIRED', async () => {
      prismaMock.vehicle.findUnique.mockResolvedValue({ id: 'v1', status: 'AVAILABLE' });
      prismaMock.vehicle.update.mockResolvedValue({ id: 'v1', status: 'RETIRED' });

      const result = await vehicleService.deleteVehicle('v1');
      expect(result.status).toBe('RETIRED');
    });
  });
});
