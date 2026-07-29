import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Auth Endpoints (/api/v1/auth)', () => {
  it('should return 404 for a non-existent user login', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'nonexistent.user.12345@example.com',
        password: 'somePassword123!',
      });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 when missing required login fields', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject unauthenticated request to /auth/me with 401', async () => {
    const res = await request(app).get('/api/v1/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
