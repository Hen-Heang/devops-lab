import { describe, expect, test } from '@jest/globals';
import request from 'supertest';
import { app } from './app.js';

describe('GET /', () => {
  test('returns the API message', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'CI practice API' });
  });
});

describe('GET /health', () => {
  test('reports a valid status, timestamp, and uptime', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(Number.isNaN(Date.parse(response.body.timestamp))).toBe(false);
    expect(response.body.uptime).toBeGreaterThanOrEqual(0);
  });
});

describe('GET /users', () => {
  test('returns the demo users', async () => {
    const response = await request(app).get('/users');
    expect(response.status).toBe(200);
    expect(response.body.users).toEqual([
      { id: 1, name: 'Ada' },
      { id: 2, name: 'Lin' }
    ]);
  });
});

describe('GET /users/:id', () => {
  test('finds the requested user', async () => {
    const response = await request(app).get('/users/2');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ user: { id: 2, name: 'Lin' } });
  });

  test('reports an unknown valid ID', async () => {
    const response = await request(app).get('/users/99');
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'User not found' });
  });

  test.each(['abc', '0', '-1', '1.5', '9007199254740992'])(
    'rejects invalid ID %s',
    async (id) => {
      const response = await request(app).get(`/users/${id}`);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid user ID' });
    }
  );
});

describe('unknown route', () => {
  test('returns a JSON 404', async () => {
    const response = await request(app).get('/missing');
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Route not found' });
  });
});
