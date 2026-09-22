const request = require('supertest');

jest.mock('../entities/data_table');

const DataTable = require('../entities/data_table');
const app = require('../app');

describe('POST /data-tables', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return 201 with the created data table when a valid alias is provided', async () => {
    const createdDataTable = {
      dataTableId: 'abc123',
      alias: 'salesData',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    DataTable.create.mockResolvedValue(createdDataTable);

    const res = await request(app).post('/data-tables').send({ alias: 'salesData' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      id: 'abc123',
      alias: 'salesData',
      aliasEditable: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
  });

  test('should return 400 when alias is missing', async () => {
    const res = await request(app).post('/data-tables').send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: 'alias is required and must be 1-32 characters, letters and numbers only',
    });
  });

  test('should return 400 when alias exceeds 32 characters', async () => {
    const res = await request(app)
      .post('/data-tables')
      .send({ alias: 'a'.repeat(33) });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: 'alias is required and must be 1-32 characters, letters and numbers only',
    });
  });

  test('should return 400 when alias contains spaces or special characters', async () => {
    const res = await request(app).post('/data-tables').send({ alias: 'sales data!' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: 'alias is required and must be 1-32 characters, letters and numbers only',
    });
  });

  test('should return 409 when alias already exists', async () => {
    DataTable.findOne.mockResolvedValue({ alias: 'salesData' });

    const res = await request(app).post('/data-tables').send({ alias: 'salesData' });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: 'alias already exists' });
  });
});
