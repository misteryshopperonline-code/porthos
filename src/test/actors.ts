import type { SessionUser } from '@/core/entities/user';

export function actor(overrides: Partial<SessionUser> = {}): SessionUser {
  return {
    id: 'user-1',
    email: 'user@porthos.com',
    name: 'User',
    role: 'OPERATOR',
    contractId: 'contract-a',
    ...overrides,
  };
}
