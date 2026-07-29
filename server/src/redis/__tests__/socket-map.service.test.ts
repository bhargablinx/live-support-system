import { describe, it, expect, vi } from 'vitest';
import { socketMapService } from '../socket-map.service.js';
import { redis } from '../redis.js';

describe('socketMapService Unit Tests', () => {
  it('should get null identity for non-existent socket', async () => {
    const identity = await socketMapService.getIdentity('non_existent_socket_id');
    expect(identity).toBeNull();
  });

  it('should return false for isConnected on non-connected actor', async () => {
    const connected = await socketMapService.isConnected('non_existent_actor_id');
    expect(connected).toBe(false);
  });

  it('should return empty array of socket IDs for offline actor', async () => {
    const socketIds = await socketMapService.getSocketIds('non_existent_actor_id');
    expect(socketIds).toEqual([]);
  });
});
