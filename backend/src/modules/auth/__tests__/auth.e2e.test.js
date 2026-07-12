const request = require('supertest');
const app = require('../../../app');
const prisma = require('../../../config/db');

describe('Auth Module E2E', () => {
  let userToken;

  it('should login a seeded user (Fleet Manager)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'manager@fleetflow.com',
        password: 'Manager@123'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user).toHaveProperty('role');
    expect(res.body.data.user.role.name).toBe('FLEET_MANAGER');

    userToken = res.body.data.token;
  });

  it('should fail login with incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'manager@fleetflow.com',
        password: 'WrongPassword'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should get current user profile using token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('manager@fleetflow.com');
  });

  it('should fail getting profile without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
