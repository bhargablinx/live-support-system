import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Conversation Endpoints (/api/v1/conversation)', () => {
  it('should return 400 when visitorToken query parameter is missing on /conversation/latest', async () => {
    const res = await request(app).get('/api/v1/conversation/latest');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 404 when visitor token does not exist on /conversation/latest', async () => {
    const res = await request(app)
      .get('/api/v1/conversation/latest?visitorToken=non_existent_token_12345');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should reject unauthenticated request to fetch agent conversation list with 401', async () => {
    const res = await request(app).get('/api/v1/conversation');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
