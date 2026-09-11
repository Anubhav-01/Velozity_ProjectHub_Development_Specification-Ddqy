import { verifyAccessToken, signAccessToken } from '../utils/jwt';
import { Role } from '@prisma/client';
import { ApiError } from '../utils/ApiError';

describe('Auth & JWT Utilities', () => {
  it('should sign and verify access token correctly', () => {
    const userId = 'user-123';
    const role = Role.ADMIN;
    const token = signAccessToken(userId, role);

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    const payload = verifyAccessToken(token);
    expect(payload.userId).toBe(userId);
    expect(payload.role).toBe(role);
    expect(payload.type).toBe('access');
  });

  it('should throw ApiError when verifying invalid token', () => {
    expect(() => {
      verifyAccessToken('invalid.token.payload');
    }).toThrow(ApiError);
  });
});
