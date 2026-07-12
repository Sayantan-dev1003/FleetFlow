const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for testing.
 * @param {string} role - The role of the user (e.g., 'FLEET_MANAGER', 'DRIVER')
 * @returns {string} The JWT token
 */
const generateTestToken = (role, userId = 1) => {
  const payload = {
    userId: userId,
    email: `test_${role.toLowerCase()}@fleetflow.com`,
    role: role,
  };
  
  // Use the test secret or fallback to default
  const secret = process.env.JWT_SECRET || 'test_secret';
  
  return jwt.sign(payload, secret, { expiresIn: '1h' });
};

module.exports = {
  generateTestToken,
};
