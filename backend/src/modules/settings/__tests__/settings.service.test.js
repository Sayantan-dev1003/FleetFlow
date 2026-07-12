const { prismaMock } = require('../../../../tests/setup/prismaMock');
const settingsService = require('../service');

describe('Settings Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSettings', () => {
    it('should return settings if they exist', async () => {
      const mockSettings = { id: 's1', depotName: 'Central Depot', currency: 'INR' };
      prismaMock.settings.findFirst.mockResolvedValue(mockSettings);

      const result = await settingsService.getSettings();
      expect(result).toEqual(mockSettings);
    });

    it('should create defaults if none exist', async () => {
      prismaMock.settings.findFirst.mockResolvedValue(null);
      const defaultSettings = { id: 's1', depotName: 'Central Depot', currency: 'INR', distanceUnit: 'km' };
      prismaMock.settings.create.mockResolvedValue(defaultSettings);

      const result = await settingsService.getSettings();
      expect(result).toEqual(defaultSettings);
    });
  });

  describe('updateSettings', () => {
    it('should update existing settings', async () => {
      const mockSettings = { id: 's1', depotName: 'Central Depot', currency: 'INR' };
      prismaMock.settings.findFirst.mockResolvedValue(mockSettings);
      
      const updatedSettings = { ...mockSettings, currency: 'USD' };
      prismaMock.settings.update.mockResolvedValue(updatedSettings);

      const result = await settingsService.updateSettings({ currency: 'USD' });
      expect(result).toEqual(updatedSettings);
    });
  });
});
