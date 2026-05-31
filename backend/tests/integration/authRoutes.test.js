const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../models/User');

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret';
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/careerconnect_test';
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Auth routes - integration tests', () => {
  it('registers a new user and returns an auth token', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
      role: 'jobseeker',
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user.email).toBe('test@example.com');
  });

  it('logs in a registered user and allows access to protected endpoint', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'login@example.com',
      password: 'Password123!',
      role: 'jobseeker',
    });

    const loginResponse = await request(app).post('/api/auth/login').send({
      email: 'login@example.com',
      password: 'Password123!',
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty('token');

    const profileResponse = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer ' + loginResponse.body.token);

    expect(profileResponse.status).toBe(200);
    expect(profileResponse.body.user.email).toBe('login@example.com');
  });
});
