const request = require('supertest');

jest.mock('../entities/user');

const User = require('../entities/user');
const app = require('../app');

describe('GET /users/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return 404 when no user matches the given id', async () => {
    User.findById.mockResolvedValue(null);

    const res = await request(app).get('/users/nonexistent');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'user not found' });
  });

  test('should return 200 with the matching user when the id exists', async () => {
    const foundUser = {
      userId: 'abc123',
      firstName: 'Alice',
      lastName: 'Doe',
      email: 'alice@example.com',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    User.findById.mockResolvedValue(foundUser);

    const res = await request(app).get('/users/abc123');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 'abc123',
      firstName: 'Alice',
      lastName: 'Doe',
      email: 'alice@example.com',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    expect(User.findById).toHaveBeenCalledWith('abc123');
  });
});
