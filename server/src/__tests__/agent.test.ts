import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import prisma from '../utils/prisma.js';

describe('Agent Management Endpoints (/api/v1/agents)', () => {
  it('should reject unauthenticated request to GET /agents with 401', async () => {
    const res = await request(app).get('/api/v1/agents');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should allow ADMIN to fetch agents list and create a new agent with display name', async () => {
    const adminEmail = `admin.agent.test.${Date.now()}@example.com`;
    const agentEmail = `agent.new.${Date.now()}@example.com`;

    // Register admin
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        organizationName: 'Agent Management Org',
        email: adminEmail,
        password: 'AdminPassword123!',
        name: 'Chief Admin',
      });

    expect(regRes.status).toBe(201);

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: adminEmail,
        password: 'AdminPassword123!',
      });

    const cookies = loginRes.get('Set-Cookie') || [];
    const accessTokenCookie = cookies.find((c: string) => c.startsWith('accessToken='));
    expect(accessTokenCookie).toBeDefined();

    // 1. Get agents
    const listRes = await request(app)
      .get('/api/v1/agents')
      .set('Cookie', [accessTokenCookie!]);

    expect(listRes.status).toBe(200);
    expect(listRes.body.success).toBe(true);
    expect(listRes.body.data.agents.length).toBeGreaterThanOrEqual(1);
    expect(listRes.body.data.agents[0].name).toBe('Chief Admin');

    // 2. Create agent as admin
    const createRes = await request(app)
      .post('/api/v1/agents')
      .set('Cookie', [accessTokenCookie!])
      .send({
        email: agentEmail,
        password: 'AgentPassword123!',
        name: 'Support Agent Bob',
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.agent.name).toBe('Support Agent Bob');
    expect(createRes.body.data.agent.email).toBe(agentEmail.toLowerCase());

    // Clean up
    const adminUser = await prisma.user.findUnique({ where: { email: adminEmail.toLowerCase() } });
    if (adminUser) {
      await prisma.user.deleteMany({ where: { organizationId: adminUser.organizationId } });
      await prisma.organization.delete({ where: { id: adminUser.organizationId } }).catch(() => {});
    }
  });

  it('should allow authenticated agent to update their display name via PATCH /agents/profile', async () => {
    const testEmail = `profile.update.${Date.now()}@example.com`;

    await request(app)
      .post('/api/v1/auth/register')
      .send({
        organizationName: 'Profile Update Org',
        email: testEmail,
        password: 'Password123!',
        name: 'Original Name',
      });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        password: 'Password123!',
      });

    const cookies = loginRes.get('Set-Cookie') || [];
    const accessTokenCookie = cookies.find((c: string) => c.startsWith('accessToken='));

    // Update profile display name
    const updateRes = await request(app)
      .patch('/api/v1/agents/profile')
      .set('Cookie', [accessTokenCookie!])
      .send({ name: 'Updated Display Name' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.data.user.name).toBe('Updated Display Name');

    // Clean up
    const user = await prisma.user.findUnique({ where: { email: testEmail.toLowerCase() } });
    if (user) {
      await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
      await prisma.organization.delete({ where: { id: user.organizationId } }).catch(() => {});
    }
  });
});
