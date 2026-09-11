import { describe, expect, it, vi } from 'vitest';
import { RegisterUserForActorUseCase } from '@/application/useCases/registerUserForActorUseCase';
import { RegisterPlatformUserUseCase } from '@/application/useCases/registerPlatformUserUseCase';
import type { UserRepositoryPort } from '@/application/ports/userRepositoryPort';
import { actor } from '@/test/actors';
import { InMemoryAuditLog } from '@/test/inMemoryAuditLog';
import { AUDIT_ACTIONS } from '@/application/ports/auditLogPort';

const hasher = {
  hash: vi.fn().mockResolvedValue('hashed'),
  compare: vi.fn(),
};

describe('RegisterUserForActorUseCase', () => {
  it('bloquea operadores y sesiones vacías', async () => {
    const inner = new RegisterPlatformUserUseCase(
      { findByEmail: vi.fn(), save: vi.fn(), listVisibleTo: vi.fn() } as unknown as UserRepositoryPort,
      hasher,
      () => 'temp',
    );
    const useCase = new RegisterUserForActorUseCase(inner, new InMemoryAuditLog());

    const noSession = await useCase.execute(null, {
      email: 'a@b.com',
      name: 'A',
      role: 'OPERATOR',
      contractId: 'c1',
    });
    expect(noSession.success).toBe(false);

    const operator = await useCase.execute(actor({ role: 'OPERATOR' }), {
      email: 'a@b.com',
      name: 'A',
      role: 'OPERATOR',
      contractId: 'c1',
    });
    expect(operator.success).toBe(false);
  });

  it('audita la creación exitosa', async () => {
    const audit = new InMemoryAuditLog();
    const inner = new RegisterPlatformUserUseCase(
      {
        findByEmail: vi.fn().mockResolvedValue(null),
        save: vi.fn().mockImplementation((data) => Promise.resolve({ ...data, id: 'u2' })),
        listVisibleTo: vi.fn(),
      } as unknown as UserRepositoryPort,
      hasher,
      () => 'temp',
    );
    const useCase = new RegisterUserForActorUseCase(inner, audit);

    const result = await useCase.execute(actor({ role: 'CONTRACT_ADMIN', contractId: 'c1' }), {
      email: 'op@x.com',
      name: 'Op',
      role: 'OPERATOR',
      contractId: 'ignored',
    });

    expect(result.success).toBe(true);
    expect(audit.entries[0]?.action).toBe(AUDIT_ACTIONS.USER_CREATED);
  });
});
