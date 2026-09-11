import { describe, expect, it, vi } from 'vitest';
import { RegisterUserForActorUseCase } from '@/application/useCases/registerUserForActorUseCase';
import { RegisterPlatformUserUseCase } from '@/application/useCases/registerPlatformUserUseCase';
import type { UserRepositoryPort } from '@/application/ports/userRepositoryPort';
import { actor } from '@/test/actors';
import { InMemoryAuditLog } from '@/test/inMemoryAuditLog';
import { InMemoryInviteTokenRepository } from '@/test/inMemoryInviteToken';
import { ConsoleMessagingAdapter } from '@/infrastructure/adapters/consoleMessagingAdapter';
import { AUDIT_ACTIONS } from '@/application/ports/auditLogPort';

const hasher = {
  hash: vi.fn().mockResolvedValue('hashed'),
  compare: vi.fn(),
};

function buildInner(repo: UserRepositoryPort) {
  return new RegisterPlatformUserUseCase(
    repo,
    hasher,
    new InMemoryInviteTokenRepository(),
    new ConsoleMessagingAdapter(),
    () => 'http://localhost:3000',
  );
}

describe('RegisterUserForActorUseCase', () => {
  it('bloquea operadores y sesiones vacías', async () => {
    const inner = buildInner({
      findByEmail: vi.fn(),
      save: vi.fn(),
      updatePassword: vi.fn(),
      listVisibleTo: vi.fn(),
    } as unknown as UserRepositoryPort);
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

  it('audita la creación exitosa con invite', async () => {
    const audit = new InMemoryAuditLog();
    const inner = buildInner({
      findByEmail: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockImplementation((data) => Promise.resolve({ ...data, id: 'u2' })),
      updatePassword: vi.fn(),
      listVisibleTo: vi.fn(),
    } as unknown as UserRepositoryPort);
    const useCase = new RegisterUserForActorUseCase(inner, audit);

    const result = await useCase.execute(actor({ role: 'CONTRACT_ADMIN', contractId: 'c1' }), {
      email: 'op@x.com',
      name: 'Op',
      role: 'OPERATOR',
      contractId: 'ignored',
    });

    expect(result.success).toBe(true);
    expect(result.inviteToken).toBeTruthy();
    expect(audit.entries[0]?.action).toBe(AUDIT_ACTIONS.USER_CREATED);
    expect(audit.entries[0]?.details).toMatchObject({ inviteIssued: true });
  });
});
