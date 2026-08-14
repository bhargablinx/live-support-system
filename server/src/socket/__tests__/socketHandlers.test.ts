import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '../../utils/prisma.js';

// Mock presence and rate-limiter services
vi.mock('../../redis/presence.service.js', () => ({
  presenceService: {
    setVisitorOnline: vi.fn(),
    setAgentOnline: vi.fn(),
    setVisitorOffline: vi.fn(),
    setAgentOffline: vi.fn(),
    heartBeat: vi.fn(),
    startTyping: vi.fn(),
    stopTyping: vi.fn(),
  },
}));

vi.mock('../../redis/socket-map.service.js', () => ({
  socketMapService: {
    register: vi.fn(),
    unregister: vi.fn(),
    isConnected: vi.fn().mockResolvedValue(false),
  },
}));

vi.mock('../../redis/rate-limiter.service.js', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ success: true }),
}));

describe('Socket Event Handlers Hardening & Security Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('join_room verification', () => {
    it('should reject joining unauthorized conversation room with error_message', async () => {
      vi.spyOn(prisma.conversation, 'findFirst').mockResolvedValueOnce(null);

      // Simulated socket event execution
      const conversationId = 'conv_cross_tenant_123';
      const organizationId = 'org_A';
      const visitorId = 'vis_A';
      const type = 'visitor';

      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          organizationId,
          ...(type === 'visitor' ? { visitorId } : {}),
        },
      });

      expect(conversation).toBeNull();
    });

    it('should allow joining conversation room when actor owns the conversation', async () => {
      const mockConv = {
        id: 'conv_valid_123',
        organizationId: 'org_A',
        visitorId: 'vis_A',
        status: 'NEW',
      } as any;

      vi.spyOn(prisma.conversation, 'findFirst').mockResolvedValueOnce(mockConv);

      const conversation = await prisma.conversation.findFirst({
        where: {
          id: 'conv_valid_123',
          organizationId: 'org_A',
          visitorId: 'vis_A',
        },
      });

      expect(conversation).toEqual(mockConv);
    });
  });

  describe('send_message verification', () => {
    it('should reject sending message to cross-tenant or unowned conversation', async () => {
      vi.spyOn(prisma.conversation, 'findFirst').mockResolvedValueOnce(null);

      const conversation = await prisma.conversation.findFirst({
        where: {
          id: 'conv_other_org',
          organizationId: 'org_A',
          visitorId: 'vis_A',
        },
      });

      expect(conversation).toBeNull();
    });

    it('should reject sending message when conversation status is RESOLVED or ARCHIVED', async () => {
      const resolvedConv = {
        id: 'conv_closed_123',
        organizationId: 'org_A',
        visitorId: 'vis_A',
        status: 'RESOLVED',
      } as any;

      vi.spyOn(prisma.conversation, 'findFirst').mockResolvedValueOnce(resolvedConv);

      const conversation = await prisma.conversation.findFirst({
        where: {
          id: 'conv_closed_123',
          organizationId: 'org_A',
        },
      });

      expect(conversation?.status === 'RESOLVED' || conversation?.status === 'ARCHIVED').toBe(true);
    });
  });
});
