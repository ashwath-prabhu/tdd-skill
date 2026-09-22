const request = require('supertest');

jest.mock('../entities/user');

const User = require('../entities/user');
const app = require('../app');

describe('DELETE /users/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return 404 when no user matches the given id', async () => {
    User.findByIdAndDelete.mockResolvedValue(null);

    const res = await request(app).delete('/users/nonexistent');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'user not found' });
  });

  test('should return 204 when the user is deleted', async () => {
    User.findByIdAndDelete.mockResolvedValue({ userId: 'abc123' });

    const res = await request(app).delete('/users/abc123');

    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
    expect(User.findByIdAndDelete).toHaveBeenCalledWith('abc123');
  });
});
