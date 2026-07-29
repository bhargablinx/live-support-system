import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import prisma from '../utils/prisma.js';

describe('Visitor Endpoints (/api/v1/visitor)', () => {
  it('should register a guest visitor when a valid organizationId is provided', async () => {
    let org = await prisma.organization.findFirst();
    if (!org) {
      org = await prisma.organization.create({
        data: { name: 'Test Org' },
      });
    }

    const payload = {
      organizationId: org.id,
      name: 'Test Visitor',
      email: `visitor_${Date.now()}@example.com`,
      currentUrl: 'http://localhost:5173',
    };

    const res = await request(app)
      .post('/api/v1/visitor')
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('visitorToken');
    expect(typeof res.body.data.visitorToken).toBe('string');
  });

  it('should return 404 when organizationId does not exist in the database', async () => {
    const res = await request(app)
      .post('/api/v1/visitor')
      .send({
        organizationId: 'non_existent_org_id_99999',
        name: 'Guest',
        email: 'guest@example.com',
      });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 when required parameters are missing', async () => {
    const res = await request(app)
      .post('/api/v1/visitor')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
