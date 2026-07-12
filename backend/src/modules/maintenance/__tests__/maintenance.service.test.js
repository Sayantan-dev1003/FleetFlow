const { prismaMock } = require('../../../../tests/setup/prismaMock');
const maintenanceService = require('../service');
const ApiError = require('../../../utils/ApiError');

describe('Maintenance Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('openMaintenance', () => {
    it('should throw error if vehicle is ON_TRIP', async () => {
      prismaMock.vehicle.findUnique.mockResolvedValue({ id: 'v1', status: 'ON_TRIP' });
      await expect(maintenanceService.openMaintenance({ vehicleId: 'v1', type: 'ROUTINE' })).rejects.toThrow(ApiError);
    });

    it('should throw error if vehicle is RETIRED', async () => {
      prismaMock.vehicle.findUnique.mockResolvedValue({ id: 'v1', status: 'RETIRED' });
      await expect(maintenanceService.openMaintenance({ vehicleId: 'v1', type: 'ROUTINE' })).rejects.toThrow(ApiError);
    });
  });

  describe('closeMaintenance', () => {
    it('should throw error if log is already CLOSED', async () => {
      prismaMock.maintenanceLog.findUnique.mockResolvedValue({ id: 'm1', status: 'CLOSED', vehicle: {} });
      await expect(maintenanceService.closeMaintenance('m1', {})).rejects.toThrow(ApiError);
    });
  });
});
