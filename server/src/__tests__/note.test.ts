import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import prisma from '../utils/prisma.js';

describe('Internal Note Endpoints (/api/v1/conversation/:id/notes)', () => {
  it('should reject unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/v1/conversation/fake-id/notes');
    expect(res.status).toBe(401);
  });

  it('should execute full Internal Note CRUD lifecycle and enforce security boundaries', async () => {
    const timestamp = Date.now();
    const adminEmail = `note.admin.${timestamp}@example.com`;
    const agentEmail = `note.agent.${timestamp}@example.com`;

    // 1. Register Org & Admin
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        organizationName: 'Note Test Org',
        email: adminEmail,
        password: 'Password123!',
        name: 'Note Admin User',
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
        name: 'Note Agent User',
      });

    expect(createAgentRes.status).toBe(201);

    // Login Agent
    const loginAgentRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: agentEmail, password: 'Password123!' });

    const agentCookie = (loginAgentRes.get('Set-Cookie') || []).find((c: string) => c.startsWith('accessToken='));
    expect(agentCookie).toBeDefined();

    // 2. Create Visitor & Conversation
    const visitorRes = await request(app)
      .post('/api/v1/visitor')
      .send({
        organizationId: orgId,
        name: 'Note Visitor',
        email: `visitor.${timestamp}@example.com`,
      });
    expect(visitorRes.status).toBe(201);
    const visitorToken = visitorRes.body.data.visitorToken;

    const convoRes = await request(app)
      .post('/api/v1/conversation')
      .send({ organizationId: orgId, visitorToken });
    expect([200, 201]).toContain(convoRes.status);
    const conversationId = convoRes.body.data.conversationId;

    // 3. Agent Creates Internal Note
    const createNoteRes = await request(app)
      .post(`/api/v1/conversation/${conversationId}/notes`)
      .set('Cookie', [agentCookie!])
      .send({ content: 'Customer has premium tier billing issue.' });

    expect(createNoteRes.status).toBe(201);
    expect(createNoteRes.body.data.content).toBe('Customer has premium tier billing issue.');
    expect(createNoteRes.body.data.author.name).toBe('Note Agent User');
    const noteId = createNoteRes.body.data.id;

    // 4. Fetch Internal Notes
    const getNotesRes = await request(app)
      .get(`/api/v1/conversation/${conversationId}/notes`)
      .set('Cookie', [agentCookie!]);
    expect(getNotesRes.status).toBe(200);
    expect(getNotesRes.body.data.length).toBe(1);
    expect(getNotesRes.body.data[0].content).toBe('Customer has premium tier billing issue.');

    // 5. Security Guarantee: Verify visitor endpoint NEVER leaks internal notes
    const visitorMsgRes = await request(app)
      .get(`/api/v1/conversation/${conversationId}/visitor-messages?visitorToken=${visitorToken}`);
    expect(visitorMsgRes.status).toBe(200);
    expect(Array.isArray(visitorMsgRes.body.data)).toBe(true);
    expect(visitorMsgRes.body.data.length).toBe(0);

    // 6. Update Note (Author only)
    const updateNoteRes = await request(app)
      .patch(`/api/v1/conversation/${conversationId}/notes/${noteId}`)
      .set('Cookie', [agentCookie!])
      .send({ content: 'Updated: Customer requested account call.' });
    expect(updateNoteRes.status).toBe(200);
    expect(updateNoteRes.body.data.content).toBe('Updated: Customer requested account call.');

    // Admin can delete note
    const deleteNoteRes = await request(app)
      .delete(`/api/v1/conversation/${conversationId}/notes/${noteId}`)
      .set('Cookie', [adminCookie!]);
    expect(deleteNoteRes.status).toBe(200);

    // Cleanup
    await prisma.conversation.deleteMany({ where: { organizationId: orgId } });
    await prisma.visitor.deleteMany({ where: { organizationId: orgId } });
    await prisma.user.deleteMany({ where: { organizationId: orgId } });
    await prisma.organization.delete({ where: { id: orgId } });
  });
});
