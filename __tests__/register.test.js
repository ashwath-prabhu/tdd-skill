const request = require('supertest');
const app = require('../app');

describe('POST /register', () => {
  test('rejects a missing firstName with a 400 and message', async () => {
    const res = await request(app).post('/register').send({
      lastName: 'Doe',
      email: 'jane@example.com',
      password: 'Abcdefg1',
    });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'First Name is required' });
  });

  test('persists a valid registration and returns the created user', async () => {
    const res = await request(app).post('/register').send({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      password: 'Abcdefg1',
    });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
    });
    expect(res.body.id).toBeDefined();
    expect(res.body.createdAt).toBeDefined();
    expect(res.body.updatedAt).toBeDefined();
  });
});
