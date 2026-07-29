import { describe, it, expect } from 'vitest';
import { RedisKey } from '../redis.key.gen.js';

describe('RedisKey Factory Unit Tests', () => {
  it('should generate correct auth refresh token key', () => {
    expect(RedisKey.refreshToken('user_123')).toBe('auth:refresh_token:user_123');
  });

  it('should generate correct presence keys for visitor and agent', () => {
    expect(RedisKey.visitorPresence('vis_456')).toBe('presence:visitor:vis_456');
    expect(RedisKey.orgOnlineVisitors('org_789')).toBe('presence:org:org_789:visitors');
    expect(RedisKey.agentPresence('agent_101')).toBe('presence:agent:agent_101');
    expect(RedisKey.orgOnlineAgents('org_789')).toBe('presence:org:org_789:agents');
  });

  it('should generate correct conversation and typing keys', () => {
    expect(RedisKey.conversation('convo_1')).toBe('conversation:convo_1');
    expect(RedisKey.typing('convo_1', 'user_2')).toBe('conversation:convo_1:typing:user_2');
  });

  it('should generate correct rate limit keys', () => {
    expect(RedisKey.rateLimit('send_msg', 'ip_127.0.0.1')).toBe('rate_limit:send_msg:ip_127.0.0.1');
  });

  it('should generate correct socket identity and user sockets keys', () => {
    expect(RedisKey.socketIdentity('sock_xyz')).toBe('socket:identity:sock_xyz');
    expect(RedisKey.userSockets('actor_abc')).toBe('socket:sockets:actor_abc');
  });
});
