import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import prisma from '../utils/prisma.js';

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

  it('should reject unauthenticated logout request with 401', async () => {
    const res = await request(app).post('/api/v1/auth/logout');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should invalidate refresh token in database on logout and reject reuse', async () => {
    const testEmail = `logout.test.${Date.now()}@example.com`;
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        organizationName: 'Logout Test Org',
        email: testEmail,
        password: 'TestPassword123!',
      });

    expect(regRes.status).toBe(201);

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        password: 'TestPassword123!',
      });

    expect(loginRes.status).toBe(200);

    const cookies = loginRes.get('Set-Cookie') || [];
    const accessTokenCookie = cookies.find((c: string) => c.startsWith('accessToken='));
    const refreshTokenCookie = cookies.find((c: string) => c.startsWith('refreshToken='));

    expect(accessTokenCookie).toBeDefined();
    expect(refreshTokenCookie).toBeDefined();

    const accessToken = accessTokenCookie ? (accessTokenCookie.split(';')[0]?.split('=')[1] ?? '') : '';
    const refreshToken = refreshTokenCookie ? (refreshTokenCookie.split(';')[0]?.split('=')[1] ?? '') : '';

    const userBeforeLogout = await prisma.user.findUnique({
      where: { email: testEmail.toLowerCase() },
    });
    expect(userBeforeLogout?.refreshToken).toBe(refreshToken);

    const logoutRes = await request(app)
      .post('/api/v1/auth/logout')
      .set('Cookie', [`accessToken=${accessToken}`]);

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.success).toBe(true);

    const userAfterLogout = await prisma.user.findUnique({
      where: { email: testEmail.toLowerCase() },
    });
    expect(userAfterLogout?.refreshToken).toBeNull();

    const refreshRes = await request(app)
      .get('/api/v1/auth/refresh-token')
      .set('Cookie', [`refreshToken=${refreshToken}`]);

    expect(refreshRes.status).toBe(401);
    expect(refreshRes.body.success).toBe(false);

    if (userBeforeLogout) {
      await prisma.user.delete({ where: { id: userBeforeLogout.id } }).catch(() => {});
      await prisma.organization.delete({ where: { id: userBeforeLogout.organizationId } }).catch(() => {});
    }
  });
});
