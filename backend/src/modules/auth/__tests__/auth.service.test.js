const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { prismaMock } = require('../../../../tests/setup/prismaMock');
const authService = require('../service');
const ApiError = require('../../../utils/ApiError');

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: 'hashed_password',
      failedLoginAttempts: 0,
      lockedUntil: null,
      role: { id: 'role1', name: 'FLEET_MANAGER' }
    };

    it('should successfully login and return a token', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mock_token');

      const result = await authService.login({ email: 'test@example.com', password: 'password123' });

      expect(result).toHaveProperty('token', 'mock_token');
      expect(result.user).toHaveProperty('email', 'test@example.com');
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        include: { role: true }
      });
    });

    it('should throw unauthorized error for invalid email', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'wrong@example.com', password: 'password123' })
      ).rejects.toThrow(ApiError);
    });

    it('should increment failed attempts on invalid password', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await expect(
        authService.login({ email: 'test@example.com', password: 'wrongpassword' })
      ).rejects.toThrow(ApiError);

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { failedLoginAttempts: 1 }
      });
    });

    it('should lock account after 5 failed attempts', async () => {
      const lockedUser = { ...mockUser, failedLoginAttempts: 4 };
      prismaMock.user.findUnique.mockResolvedValue(lockedUser);
      bcrypt.compare.mockResolvedValue(false);

      await expect(
        authService.login({ email: 'test@example.com', password: 'wrongpassword' })
      ).rejects.toThrow('Account locked due to 5 failed attempts. Please try again later.');

      expect(prismaMock.user.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: lockedUser.id },
        data: expect.objectContaining({ failedLoginAttempts: 5 })
      }));
    });
  });
});
