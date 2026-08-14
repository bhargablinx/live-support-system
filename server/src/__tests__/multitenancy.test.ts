import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import prisma from '../utils/prisma.js';

describe('Multi-Tenancy Isolation Guards', () => {
  it('should prevent an agent from Org A from accessing or claiming conversations of Org B', async () => {
    const timestamp = Date.now();
    const orgAAdmin = `admin.orga.${timestamp}@example.com`;
    const orgBAdmin = `admin.orgb.${timestamp}@example.com`;

    // Create Org A & Admin A
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        organizationName: 'Organization Alpha',
        email: orgAAdmin,
        password: 'Password123!',
      });

    // Create Org B & Admin B
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        organizationName: 'Organization Beta',
        email: orgBAdmin,
        password: 'Password123!',
      });

    // Login Admin A
    const loginARes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: orgAAdmin, password: 'Password123!' });
    const cookieA = (loginARes.get('Set-Cookie') || []).find((c: string) => c.startsWith('accessToken='));

    // Login Admin B
    const loginBRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: orgBAdmin, password: 'Password123!' });
    const cookieB = (loginBRes.get('Set-Cookie') || []).find((c: string) => c.startsWith('accessToken='));

    // Create Visitor & Conversation in Org B
    const userB = await prisma.user.findUnique({ where: { email: orgBAdmin.toLowerCase() } });
    expect(userB).toBeDefined();

    const visitorB = await prisma.visitor.create({
      data: {
        organizationId: userB!.organizationId,
        token: `token-b-${timestamp}`,
        name: 'Visitor Beta',
        email: 'visitorb@example.com',
      },
    });

    const conversationB = await prisma.conversation.create({
      data: {
        organizationId: userB!.organizationId,
        visitorId: visitorB.id,
      },
    });

    // Admin A attempts to claim Org B's conversation -> should return 404 (multi-tenancy guard)
    const claimRes = await request(app)
      .post(`/api/v1/conversation/${conversationB.id}/claim`)
      .set('Cookie', [cookieA!]);

    expect(claimRes.status).toBe(404);
    expect(claimRes.body.success).toBe(false);

    // Admin B claims Org B's conversation -> should succeed 200
    const claimBRes = await request(app)
      .post(`/api/v1/conversation/${conversationB.id}/claim`)
      .set('Cookie', [cookieB!]);

    expect(claimBRes.status).toBe(200);
    expect(claimBRes.body.success).toBe(true);

    // Clean up
    const userA = await prisma.user.findUnique({ where: { email: orgAAdmin.toLowerCase() } });
    if (userA) {
      await prisma.user.delete({ where: { id: userA.id } }).catch(() => {});
      await prisma.organization.delete({ where: { id: userA.organizationId } }).catch(() => {});
    }
    if (userB) {
      await prisma.conversation.delete({ where: { id: conversationB.id } }).catch(() => {});
      await prisma.visitor.delete({ where: { id: visitorB.id } }).catch(() => {});
      await prisma.user.delete({ where: { id: userB.id } }).catch(() => {});
      await prisma.organization.delete({ where: { id: userB.organizationId } }).catch(() => {});
    }
  });
});
