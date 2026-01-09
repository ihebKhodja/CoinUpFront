import { decodeJwtPayload, extractJwtRoles, isAdminToken } from './jwt.utils';

function base64UrlEncode(obj: unknown): string {
  const json = JSON.stringify(obj);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function makeToken(payload: Record<string, unknown>): string {
  const header = { alg: 'none', typ: 'JWT' };
  return `${base64UrlEncode(header)}.${base64UrlEncode(payload)}.`;
}

describe('jwt.utils', () => {
  it('decodeJwtPayload returns null for invalid token', () => {
    expect(decodeJwtPayload(null)).toBeNull();
    expect(decodeJwtPayload(undefined)).toBeNull();
    expect(decodeJwtPayload('not-a-jwt')).toBeNull();
  });

  it('decodeJwtPayload decodes payload', () => {
    const token = makeToken({ sub: '123', email: 'a@b.com' });
    const payload = decodeJwtPayload(token);
    expect(payload).toBeTruthy();
    expect(payload?.['sub']).toBe('123');
    expect(payload?.['email']).toBe('a@b.com');
  });

  it('extractJwtRoles supports string and array claims', () => {
    expect(extractJwtRoles(null)).toEqual([]);

    const roles1 = extractJwtRoles({ role: 'Admin' });
    expect(roles1).toEqual(['Admin']);

    const roles2 = extractJwtRoles({ roles: ['User', 'Admin', 'User'] });
    expect(roles2.sort()).toEqual(['Admin', 'User']);

    const roles3 = extractJwtRoles({
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': ['Admin'],
    });
    expect(roles3).toEqual(['Admin']);
  });

  it('isAdminToken detects admin role (case-insensitive)', () => {
    expect(isAdminToken(null)).toBeFalse();

    const adminToken = makeToken({ role: 'Admin' });
    expect(isAdminToken(adminToken)).toBeTrue();

    const adminToken2 = makeToken({ roles: ['user', 'ADMIN'] });
    expect(isAdminToken(adminToken2)).toBeTrue();

    const userToken = makeToken({ role: 'User' });
    expect(isAdminToken(userToken)).toBeFalse();
  });
});
