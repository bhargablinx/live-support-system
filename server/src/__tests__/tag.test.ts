import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import prisma from '../utils/prisma.js';

describe('Tag Endpoints (/api/v1/tags & /api/v1/conversation/:id/tags)', () => {
  it('should reject unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/v1/tags');
    expect(res.status).toBe(401);
  });

  it('should execute full Tag CRUD and Conversation Tagging lifecycle', async () => {
    const timestamp = Date.now();
    const adminEmail = `tag.admin.${timestamp}@example.com`;
    const agentEmail = `tag.agent.${timestamp}@example.com`;

    // 1. Register Org & Admin
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        organizationName: 'Tag Test Org',
        email: adminEmail,
        password: 'Password123!',
        name: 'Tag Admin User',
      });

    expect(regRes.status).toBe(201);
    const orgId = regRes.body.data.organization.id;

    // Login Admin
    const loginAdminRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: adminEmail, password: 'Password123!' });

    const adminCookie = (loginAdminRes.get('Set-Cookie') || []).find((c: string) => c.startsWith('accessToken='));
    expect(adminCookie).toBeDefined();

    // Create AGENT user
    const createAgentRes = await request(app)
      .post('/api/v1/agents')
      .set('Cookie', [adminCookie!])
      .send({
        email: agentEmail,
        password: 'Password123!',
        name: 'Tag Agent User',
      });

    expect(createAgentRes.status).toBe(201);

    // Login Agent
    const loginAgentRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: agentEmail, password: 'Password123!' });

    const agentCookie = (loginAgentRes.get('Set-Cookie') || []).find((c: string) => c.startsWith('accessToken='));
    expect(agentCookie).toBeDefined();

    // 2. Admin Creates Tag
    const createTagRes = await request(app)
      .post('/api/v1/tags')
      .set('Cookie', [adminCookie!])
      .send({
        name: 'Billing',
        color: '#ff5722',
      });

    expect(createTagRes.status).toBe(201);
    expect(createTagRes.body.data.name).toBe('Billing');
    expect(createTagRes.body.data.color).toBe('#ff5722');
    const tagId = createTagRes.body.data.id;

    // Reject non-admin creating tag
    const agentCreateTagRes = await request(app)
      .post('/api/v1/tags')
      .set('Cookie', [agentCookie!])
      .send({ name: 'Tech Support' });
    expect(agentCreateTagRes.status).toBe(403);

    // Reject duplicate tag creation
    const duplicateRes = await request(app)
      .post('/api/v1/tags')
      .set('Cookie', [adminCookie!])
      .send({ name: 'Billing' });
    expect(duplicateRes.status).toBe(409);

    // 3. Get Tags List
    const getTagsRes = await request(app)
      .get('/api/v1/tags')
      .set('Cookie', [agentCookie!]);
    expect(getTagsRes.status).toBe(200);
    expect(getTagsRes.body.data.length).toBe(1);
    expect(getTagsRes.body.data[0].name).toBe('Billing');

    // 4. Update Tag (Admin only)
    const updateTagRes = await request(app)
      .patch(`/api/v1/tags/${tagId}`)
      .set('Cookie', [adminCookie!])
      .send({ color: '#4caf50' });
    expect(updateTagRes.status).toBe(200);
    expect(updateTagRes.body.data.color).toBe('#4caf50');

    // 5. Create Visitor & Conversation
    const visitorRes = await request(app)
      .post('/api/v1/visitor')
      .send({
        organizationId: orgId,
        name: 'Tag Visitor',
        email: `visitor.${timestamp}@example.com`,
      });
    expect(visitorRes.status).toBe(201);
    const visitorToken = visitorRes.body.data.visitorToken;

    const convoRes = await request(app)
      .post('/api/v1/conversation')
      .send({ organizationId: orgId, visitorToken });
    expect([200, 201]).toContain(convoRes.status);
    const conversationId = convoRes.body.data.conversationId;

    // 6. Agent Adds Tag to Conversation
    const addTagRes = await request(app)
      .post(`/api/v1/conversation/${conversationId}/tags`)
      .set('Cookie', [agentCookie!])
      .send({ tagId });
    expect(addTagRes.status).toBe(200);
    expect(addTagRes.body.data.tagId).toBe(tagId);

    // 7. Verify Conversation list returned with tags and filter by tagId works
    const convoListRes = await request(app)
      .get(`/api/v1/conversation?tagId=${tagId}`)
      .set('Cookie', [agentCookie!]);
    expect(convoListRes.status).toBe(200);
    expect(convoListRes.body.data.conversations.length).toBe(1);
    expect(convoListRes.body.data.conversations[0].tags.length).toBe(1);
    expect(convoListRes.body.data.conversations[0].tags[0].tag.name).toBe('Billing');

    // 8. Remove Tag from Conversation
    const removeTagRes = await request(app)
      .delete(`/api/v1/conversation/${conversationId}/tags/${tagId}`)
      .set('Cookie', [agentCookie!]);
    expect(removeTagRes.status).toBe(200);

    // 9. Delete Tag
    const deleteTagRes = await request(app)
      .delete(`/api/v1/tags/${tagId}`)
      .set('Cookie', [adminCookie!]);
    expect(deleteTagRes.status).toBe(200);

    // Cleanup
    await prisma.conversation.deleteMany({ where: { organizationId: orgId } });
    await prisma.visitor.deleteMany({ where: { organizationId: orgId } });
    await prisma.user.deleteMany({ where: { organizationId: orgId } });
    await prisma.organization.delete({ where: { id: orgId } });
  });
});
