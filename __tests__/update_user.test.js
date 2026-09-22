const request = require('supertest');

jest.mock('../entities/user');

const User = require('../entities/user');
const app = require('../app');

describe('PUT /users/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return 404 when no user matches the given id', async () => {
    User.findById.mockResolvedValue(null);

    const res = await request(app)
      .put('/users/nonexistent')
      .send({ firstName: 'Alice', email: 'alice@example.com' });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'user not found' });
  });

  test('should return 400 when firstName is missing', async () => {
    User.findById.mockResolvedValue({
      userId: 'abc123',
      firstName: 'Alice',
      lastName: 'Doe',
      email: 'alice@example.com',
    });

    const res = await request(app).put('/users/abc123').send({ email: 'alice@example.com' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'firstName and email are required' });
  });

  test('should return 400 when email is missing', async () => {
    User.findById.mockResolvedValue({
      userId: 'abc123',
      firstName: 'Alice',
      lastName: 'Doe',
      email: 'alice@example.com',
    });

    const res = await request(app).put('/users/abc123').send({ firstName: 'Alice' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'firstName and email are required' });
  });

  test('should return 200 with the updated user when a valid payload is given', async () => {
    const existingUser = {
      userId: 'abc123',
      firstName: 'Alice',
      lastName: 'Doe',
      email: 'alice@example.com',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      save: jest.fn().mockImplementation(function save() {
        this.updatedAt = '2026-01-02T00:00:00.000Z';
        return Promise.resolve(this);
      }),
    };
    User.findById.mockResolvedValue(existingUser);

    const res = await request(app)
      .put('/users/abc123')
      .send({ firstName: 'Alicia', lastName: 'Doe', email: 'alicia@example.com' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 'abc123',
      firstName: 'Alicia',
      lastName: 'Doe',
      email: 'alicia@example.com',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    });
    expect(existingUser.save).toHaveBeenCalled();
  });
});
