const request = require('supertest');

jest.mock('../entities/user');

const User = require('../entities/user');
const app = require('../app');

describe('POST /users', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return 400 when firstName is missing', async () => {
    const res = await request(app).post('/users').send({ email: 'alice@example.com' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'firstName and email are required' });
  });

  test('should return 400 when email is missing', async () => {
    const res = await request(app).post('/users').send({ firstName: 'Alice' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'firstName and email are required' });
  });

  test('should return 201 with the created user when firstName and email are provided', async () => {
    const createdUser = {
      userId: 'abc123',
      firstName: 'Alice',
      lastName: 'Doe',
      email: 'alice@example.com',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    User.create.mockResolvedValue(createdUser);

    const res = await request(app)
      .post('/users')
      .send({ firstName: 'Alice', lastName: 'Doe', email: 'alice@example.com' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      id: 'abc123',
      firstName: 'Alice',
      lastName: 'Doe',
      email: 'alice@example.com',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
  });
});
