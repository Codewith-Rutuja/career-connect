const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../models/User');

beforeAll(async () => {
  process.env.JWT_SECRET = 'security-test-secret';
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/careerconnect_test';
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Security tests - auth guard', () => {
  it('rejects missing Authorization header with 401', async () => {
    const response = await request(app).get('/api/auth/me');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Authorization token is missing.' });
  });

  it('rejects malformed Authorization header with 401', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Token malformed');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Authorization token is missing.' });
  });

  it('rejects invalid JWT token with 401', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.value');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Invalid or expired token.' });
  });
});
