const request = require('supertest');

jest.mock('../entities/user');

const User = require('../entities/user');
const app = require('../app');

describe('GET /users', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return 200 with an empty envelope when no users exist', async () => {
    User.countDocuments.mockResolvedValue(0);
    User.find.mockReturnValue({
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
    });

    const res = await request(app).get('/users');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      data: [],
      pagination: { total_records: 0, current_page: 1, total_pages: 1 },
    });
  });

  test('should return 200 with all users and their display fields when no page/limit is given', async () => {
    const mockUsers = [
      {
        userId: 'abc123',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        userId: 'def456',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john@example.com',
        createdAt: '2026-01-02T00:00:00.000Z',
      },
    ];
    User.countDocuments.mockResolvedValue(2);
    User.find.mockReturnValue({
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(mockUsers),
    });

    const res = await request(app).get('/users');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      data: mockUsers,
      pagination: { total_records: 2, current_page: 1, total_pages: 1 },
    });
  });

  test('should return 200 with a paginated page of users when page/limit are given', async () => {
    const page1Users = Array.from({ length: 10 }, (_, i) => ({
      userId: `user${i}`,
      firstName: `First${i}`,
      lastName: `Last${i}`,
      email: `user${i}@example.com`,
      createdAt: '2026-01-01T00:00:00.000Z',
    }));
    User.countDocuments.mockResolvedValue(25);
    const skipMock = jest.fn().mockReturnThis();
    const limitMock = jest.fn().mockResolvedValue(page1Users);
    User.find.mockReturnValue({ skip: skipMock, limit: limitMock });

    const res = await request(app).get('/users?page=1&limit=10');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      data: page1Users,
      pagination: { total_records: 25, current_page: 1, total_pages: 3 },
    });
    expect(skipMock).toHaveBeenCalledWith(0);
    expect(limitMock).toHaveBeenCalledWith(10);
  });
});
