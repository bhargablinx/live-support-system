import { describe, it, expect } from 'vitest';
import { presenceService } from '../presence.service.js';

describe('presenceService Unit Tests', () => {
  it('should return false for isVisitorOnline on offline visitor', async () => {
    const isOnline = await presenceService.isVisitorOnline('non_existent_visitor');
    expect(isOnline).toBe(false);
  });

  it('should return empty array for getOnlineAgents on organization without active agents', async () => {
    const agents = await presenceService.getOnlineAgents('empty_org_id');
    expect(agents).toEqual([]);
  });

  it('should return empty array for getTypingUsers on conversation without active typing indicators', async () => {
    const typingUsers = await presenceService.getTypingUsers('empty_convo_id');
    expect(typingUsers).toEqual([]);
  });
});
