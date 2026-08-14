import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import prisma from '../utils/prisma.js';

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

  it('should execute full conversation lifecycle: create -> claim -> resolve -> reopen -> delete', async () => {
    const timestamp = Date.now();
    const adminEmail = `convo.lifecycle.${timestamp}@example.com`;

    // 1. Register Org & Admin
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        organizationName: 'Lifecycle Test Org',
        email: adminEmail,
        password: 'Password123!',
        name: 'Agent Support Pro',
      });

    expect(regRes.status).toBe(201);
    const orgId = regRes.body.data.organization.id;

    // Login Admin
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: adminEmail, password: 'Password123!' });

    const cookie = (loginRes.get('Set-Cookie') || []).find((c: string) => c.startsWith('accessToken='));
    expect(cookie).toBeDefined();

    // 2. Create Visitor
    const visitorRes = await request(app)
      .post('/api/v1/visitor')
      .send({
        organizationId: orgId,
        name: 'Alice Visitor',
        email: 'alice@visitor.com',
      });

    expect(visitorRes.status).toBe(201);
    const visitorToken = visitorRes.body.data.visitorToken;

    // 3. Visitor Creates Conversation
    const convoRes = await request(app)
      .post('/api/v1/conversation')
      .send({
        organizationId: orgId,
        visitorToken,
      });

    expect([200, 201]).toContain(convoRes.status);
    const conversationId = convoRes.body.data.conversationId;

    // 4. Agent Claims Conversation
    const claimRes = await request(app)
      .post(`/api/v1/conversation/${conversationId}/claim`)
      .set('Cookie', [cookie!]);

    expect(claimRes.status).toBe(200);
    expect(claimRes.body.data.status).toBe('CLAIMED');
    expect(claimRes.body.data.assignedUser.name).toBe('Agent Support Pro');

    // 5. Agent Resolves Conversation
    const resolveRes = await request(app)
      .post(`/api/v1/conversation/${conversationId}/resolve`)
      .set('Cookie', [cookie!]);

    expect(resolveRes.status).toBe(200);
    expect(resolveRes.body.data.status).toBe('RESOLVED');

    // 6. Agent Reopens Conversation
    const reopenRes = await request(app)
      .post(`/api/v1/conversation/${conversationId}/reopen`)
      .set('Cookie', [cookie!]);

    expect(reopenRes.status).toBe(200);
    expect(reopenRes.body.data.status).toBe('CLAIMED');

    // 7. Admin Deletes Conversation
    const deleteRes = await request(app)
      .delete(`/api/v1/conversation/${conversationId}`)
      .set('Cookie', [cookie!]);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);

    // Clean up
    const user = await prisma.user.findUnique({ where: { email: adminEmail.toLowerCase() } });
    if (user) {
      await prisma.visitor.deleteMany({ where: { organizationId: orgId } });
      await prisma.user.delete({ where: { id: user.id } });
      await prisma.organization.delete({ where: { id: orgId } });
    }
  });
});
