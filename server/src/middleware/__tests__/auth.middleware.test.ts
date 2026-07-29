import { describe, it, expect, vi } from 'vitest';
import { verifyJwt, authorizeRole } from '../auth.middleware.js';
import { ApiError } from '../../utils/ApiError.js';

describe('Auth Middleware Unit Tests', () => {
  describe('verifyJwt', () => {
    it('should pass ApiError(401) to next() when no access token is provided', async () => {
      const req: any = { cookies: {}, header: () => undefined };
      const res: any = {};
      const next = vi.fn();

      await verifyJwt(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      const err = next.mock.calls[0]![0];
      expect(err.statusCode).toBe(401);
    });
  });

  describe('authorizeRole', () => {
    it('should call next() with no arguments when req.user role matches allowed roles', async () => {
      const req: any = { user: { id: '1', role: 'ADMIN' } };
      const res: any = {};
      const next = vi.fn();

      const middleware = authorizeRole('ADMIN', 'AGENT');
      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should pass ApiError(403) to next() when req.user role is not in allowed roles', async () => {
      const req: any = { user: { id: '1', role: 'AGENT' } };
      const res: any = {};
      const next = vi.fn();

      const middleware = authorizeRole('ADMIN');
      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      const err = next.mock.calls[0]![0];
      expect(err.statusCode).toBe(403);
    });

    it('should pass ApiError(401) to next() when req.user is missing', async () => {
      const req: any = {};
      const res: any = {};
      const next = vi.fn();

      const middleware = authorizeRole('ADMIN');
      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      const err = next.mock.calls[0]![0];
      expect(err.statusCode).toBe(401);
    });
  });
});
