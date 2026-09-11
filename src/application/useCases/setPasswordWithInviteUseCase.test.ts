import { describe, expect, it, vi } from 'vitest';
import { SetPasswordWithInviteUseCase } from '@/application/useCases/setPasswordWithInviteUseCase';
import type { UserEntity, UserRepositoryPort } from '@/application/ports/userRepositoryPort';
import { InMemoryInviteTokenRepository } from '@/test/inMemoryInviteToken';
import { InMemoryAuditLog } from '@/test/inMemoryAuditLog';
import { AUDIT_ACTIONS } from '@/application/ports/auditLogPort';

describe('SetPasswordWithInviteUseCase', () => {
  it('activa la cuenta con token válido y no reutiliza el token', async () => {
    const invites = new InMemoryInviteTokenRepository();
    const audit = new InMemoryAuditLog();
    const users = new Map<string, UserEntity>();
    users.set('op@x.com', {
      id: 'u1',
      email: 'op@x.com',
      name: 'Op',
      role: 'OPERATOR',
      contractId: 'c1',
      passwordHash: null,
    });

    const repo: UserRepositoryPort = {
      findByEmail: async (email) => users.get(email) ?? null,
      save: async (u) => ({ ...u, id: 'new' }),
      updatePassword: async (email, passwordHash) => {
        const current = users.get(email);
        if (!current) return null;
        const next = { ...current, passwordHash };
        users.set(email, next);
        return next;
      },
      listVisibleTo: async () => [],
    };

    const useCase = new SetPasswordWithInviteUseCase(
      invites,
      repo,
      { hash: vi.fn().mockResolvedValue('hashed-pass'), compare: vi.fn() },
      audit,
    );

    const token = await invites.create('op@x.com', new Date(Date.now() + 60_000));
    const first = await useCase.execute({ token, password: 'secreto12' });
    const second = await useCase.execute({ token, password: 'secreto12' });

    expect(first.success).toBe(true);
    expect(second.success).toBe(false);
    expect(users.get('op@x.com')?.passwordHash).toBe('hashed-pass');
    expect(audit.entries[0]?.action).toBe(AUDIT_ACTIONS.PASSWORD_SET_VIA_INVITE);
  });

  it('rechaza contraseñas cortas y tokens inválidos', async () => {
    const useCase = new SetPasswordWithInviteUseCase(
      new InMemoryInviteTokenRepository(),
      {
        findByEmail: async () => null,
        save: async (u) => ({ ...u, id: '1' }),
        updatePassword: async () => null,
        listVisibleTo: async () => [],
      },
      { hash: vi.fn(), compare: vi.fn() },
      new InMemoryAuditLog(),
    );

    expect((await useCase.execute({ token: 'x', password: 'short' })).success).toBe(false);
    expect((await useCase.execute({ token: 'bad', password: 'longenough' })).success).toBe(false);
  });
});
