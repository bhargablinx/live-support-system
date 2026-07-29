import { describe, it, expect, vi } from 'vitest';
import { authenticateSocket } from '../authenticateSocket.js';
import prisma from '../../utils/prisma.js';

describe('Socket.IO authenticateSocket Middleware Unit Tests', () => {
  it('should call next with Error when no authentication is provided in handshake', async () => {
    const socket: any = {
      handshake: {
        auth: {},
        headers: {},
      },
      data: {},
    };

    const next = vi.fn();
    await authenticateSocket(socket, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0]![0].message).toBe('No auth provided');
  });

  it('should call next with Error when visitor token does not exist in DB', async () => {
    const socket: any = {
      handshake: {
        auth: { visitorToken: 'non_existent_visitor_token_123' },
        headers: {},
      },
      data: {},
    };

    const next = vi.fn();
    await authenticateSocket(socket, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0]![0].message).toBe('Invalid visitor token');
  });
});
