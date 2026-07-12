const { prismaMock } = require('../../../../tests/setup/prismaMock');
const driverService = require('../service');
const ApiError = require('../../../utils/ApiError');

describe('Driver Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createDriver', () => {
    it('should throw error if license is already expired', async () => {
      const pastDate = new Date(Date.now() - 86400000).toISOString(); // 1 day ago
      await expect(
        driverService.createDriver({
          name: 'Expired License',
          licenseExpiryDate: pastDate
        })
      ).rejects.toThrow(ApiError);
    });

    it('should create a driver with valid license', async () => {
      const futureDate = new Date(Date.now() + 86400000 * 10).toISOString();
      const mockData = { name: 'Valid Driver', licenseExpiryDate: futureDate };

      prismaMock.driver.create.mockResolvedValue({
        id: 'd1',
        ...mockData,
        status: 'AVAILABLE'
      });

      const result = await driverService.createDriver(mockData);
      expect(result).toHaveProperty('id', 'd1');
      expect(prismaMock.driver.create).toHaveBeenCalled();
    });
  });

  describe('deleteDriver', () => {
    it('should throw error if driver is ON_TRIP', async () => {
      prismaMock.driver.findUnique.mockResolvedValue({ id: 'd1', status: 'ON_TRIP' });
      await expect(driverService.deleteDriver('d1')).rejects.toThrow(ApiError);
    });

    it('should suspend driver', async () => {
      prismaMock.driver.findUnique.mockResolvedValue({ id: 'd1', status: 'AVAILABLE' });
      prismaMock.driver.update.mockResolvedValue({ id: 'd1', status: 'SUSPENDED' });

      const result = await driverService.deleteDriver('d1');
      expect(result.status).toBe('SUSPENDED');
    });
  });
});
