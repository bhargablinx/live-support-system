import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('GET /api/v1/health', () => {
  it('should return 200 OK with health status message', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'ok');
  });
});
