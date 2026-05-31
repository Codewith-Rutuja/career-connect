const request = require('supertest');
const app = require('../../app');

describe('System test - API health', () => {
  it('returns a running status from the root API endpoint', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'CareerConnect API is running.' });
  });
});