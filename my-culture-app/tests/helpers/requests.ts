// Build requests as route handlers receive them after the proxy.

import type { Role } from '@/lib/types';

export const asUser = (role: Role, userId = 1) => ({
  'x-user-id': String(userId),
  'x-user-email': `${role.toLowerCase()}@example.com`,
  'x-user-role': role,
});

export function jsonRequest(
  url: string,
  method: string,
  body?: unknown,
  headers: Record<string, string> = {}
) {
  return new Request(`http://localhost:3000${url}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export function formRequest(url: string, form: FormData) {
  return new Request(`http://localhost:3000${url}`, {
    method: 'POST',
    body: form,
  });
}

export const params = (id: string | number) => ({
  params: Promise.resolve({ id: String(id) }),
});

export const PNG_BYTES = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0,
]);
