import { describe, expect, it, vi } from 'vitest';
import { RegisterUserForActorUseCase } from '@/application/useCases/registerUserForActorUseCase';
import { RegisterPlatformUserUseCase } from '@/application/useCases/registerPlatformUserUseCase';
import type { UserRepositoryPort } from '@/application/ports/userRepositoryPort';
import { actor } from '@/test/actors';

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
    const useCase = new RegisterUserForActorUseCase(inner);

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
});
