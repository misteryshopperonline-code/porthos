import { describe, expect, it, vi } from 'vitest';
import { LoginUserUseCase } from '@/application/useCases/loginUserUseCase';
import type { PasswordHasherPort } from '@/application/ports/passwordHasherPort';
import type { UserRepositoryPort } from '@/application/ports/userRepositoryPort';

const hasher: PasswordHasherPort = {
  hash: vi.fn(),
  compare: vi.fn(),
};

describe('LoginUserUseCase', () => {
  it('no revela si el usuario existe o la clave es incorrecta', async () => {
    const missing = new LoginUserUseCase(
      { findByEmail: vi.fn().mockResolvedValue(null), save: vi.fn(), updatePassword: vi.fn(), listVisibleTo: vi.fn() } as unknown as UserRepositoryPort,
      hasher,
    );
    const missingResult = await missing.execute('a@b.com', 'x');

    const compare = vi.fn().mockResolvedValue(false);
    const wrong = new LoginUserUseCase(
      {
        findByEmail: vi.fn().mockResolvedValue({
          id: '1',
          email: 'a@b.com',
          name: 'A',
          role: 'OPERATOR',
          contractId: 'c1',
          passwordHash: 'hash',
        }),
        save: vi.fn(),
        updatePassword: vi.fn(),
        listVisibleTo: vi.fn(),
      },
      { hash: vi.fn(), compare },
    );
    const wrongResult = await wrong.execute('a@b.com', 'bad');

    expect(missingResult.success).toBe(false);
    expect(wrongResult.success).toBe(false);
    expect(missingResult.error).toBe(wrongResult.error);
  });

  it('devuelve el usuario sin passwordHash', async () => {
    const useCase = new LoginUserUseCase(
      {
        findByEmail: vi.fn().mockResolvedValue({
          id: '1',
          email: 'a@b.com',
          name: 'A',
          role: 'GLOBAL_ADMIN',
          contractId: null,
          passwordHash: 'hash',
        }),
        save: vi.fn(),
        updatePassword: vi.fn(),
        listVisibleTo: vi.fn(),
      },
      { hash: vi.fn(), compare: vi.fn().mockResolvedValue(true) },
    );

    const result = await useCase.execute('a@b.com', 'ok');
    expect(result.success).toBe(true);
    expect(result.user).toMatchObject({ id: '1', role: 'GLOBAL_ADMIN' });
    expect(result.user).not.toHaveProperty('passwordHash');
  });
});
