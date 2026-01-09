export interface JwtPayload {
  [key: string]: unknown;
}

function base64UrlDecode(input: string): string {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = normalized.length % 4;
  const padded = pad ? normalized + '='.repeat(4 - pad) : normalized;
  return decodeURIComponent(
    atob(padded)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
}

export function decodeJwtPayload(token: string | null | undefined): JwtPayload | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;

  try {
    const json = base64UrlDecode(parts[1]);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function extractJwtRoles(payload: JwtPayload | null): string[] {
  if (!payload) return [];

  const roleKeys = [
    'role',
    'roles',
    'Role',
    'Roles',
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
  ];

  const roles: string[] = [];
  for (const key of roleKeys) {
    const value = payload[key];
    if (typeof value === 'string') {
      roles.push(value);
    } else if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'string') roles.push(item);
      }
    }
  }

  return Array.from(new Set(roles));
}

export function isAdminToken(token: string | null | undefined): boolean {
  const payload = decodeJwtPayload(token);
  const roles = extractJwtRoles(payload);
  return roles.some((r) => String(r).toLowerCase() === 'admin');
}
