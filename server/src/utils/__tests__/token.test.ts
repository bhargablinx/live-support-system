import { describe, it, expect, vi } from 'vitest';
import { generateAccessToken, generateRefreshToken } from '../token.js';
import jwt from 'jsonwebtoken';

describe('Token Generation Utilities Unit Tests', () => {
  const mockUser = {
    id: 'usr_12345',
    email: 'agent@example.com',
    role: 'AGENT' as const,
    organizationId: 'org_98765',
    passwordHash: 'hashedpass',
    refreshToken: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should generate a valid JWT access token containing user claims', () => {
    const token = generateAccessToken(mockUser);
    expect(typeof token).toBe('string');

    const decoded = jwt.decode(token) as any;
    expect(decoded).toBeDefined();
    expect(decoded.id).toBe(mockUser.id);
    expect(decoded.email).toBe(mockUser.email);
    expect(decoded.role).toBe(mockUser.role);
    expect(decoded.organizationId).toBe(mockUser.organizationId);
  });

  it('should generate a valid JWT refresh token containing user id claim', () => {
    const token = generateRefreshToken(mockUser);
    expect(typeof token).toBe('string');

    const decoded = jwt.decode(token) as any;
    expect(decoded).toBeDefined();
    expect(decoded.id).toBe(mockUser.id);
  });
});
