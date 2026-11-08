import { describe, it, expect } from 'vitest';
import { signJwtToken, verifyJwtToken } from '../src/utils/jwt.js';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

describe('Auth & Security Utilities', () => {
  it('signs and verifies JWT token accurately with role and vendorId', () => {
    const payload = {
      userId: 'user-12345',
      email: 'vendor@royalwheels.in',
      role: Role.VENDOR,
      vendorId: 'vendor-67890',
    };

    const token = signJwtToken(payload);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(20);

    const decoded = verifyJwtToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(Role.VENDOR);
    expect(decoded.vendorId).toBe(payload.vendorId);
  });

  it('hashes passwords securely and verifies correctly with bcrypt', async () => {
    const plain = 'Customer@12345';
    const hash = await bcrypt.hash(plain, 10);
    expect(hash).not.toBe(plain);
    expect(hash.startsWith('$2')).toBe(true);

    const matches = await bcrypt.compare(plain, hash);
    expect(matches).toBe(true);

    const wrongMatches = await bcrypt.compare('WrongPassword', hash);
    expect(wrongMatches).toBe(false);
  });
});
